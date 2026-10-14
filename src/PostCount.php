<?php

/*
 * This file is part of fof/categories
 *
 * Copyright (c) 2021 Alexander Skvortsov.
 * Copyright (c) 2026 FriendsOfFlarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace FoF\Categories;

use Illuminate\Database\ConnectionInterface;

/**
 * Keeps `tags.post_count` in step with the tag's discussions.
 *
 * A tag's post count is the number of comments in its discussions that are neither private nor
 * hidden, the same discussions its `discussion_count` counts. Core keeps each discussion's
 * `comment_count` up to date, so the count changes by however much a discussion's contribution does.
 */
class PostCount
{
    public function __construct(
        protected ConnectionInterface $db
    ) {
    }

    /**
     * Add `$delta` to the tags' post counts, never going below zero.
     *
     * @param iterable<int|string> $tagIds
     */
    public function adjust(iterable $tagIds, int $delta): void
    {
        $tagIds = collect($tagIds)->all();

        if ($delta === 0 || ! $tagIds) {
            return;
        }

        $query = $this->db->table('tags')->whereIn('id', $tagIds);

        if ($delta > 0) {
            $query->increment('post_count', $delta);
        } else {
            // The column is unsigned, and a count that was already wrong mustn't make a deletion fail.
            $query->update([
                'post_count' => $this->db->raw('CASE WHEN post_count > '.-$delta.' THEN post_count - '.-$delta.' ELSE 0 END'),
            ]);
        }
    }

    /**
     * Count every tag's posts afresh. This reads every tagged discussion, so it is for correcting
     * the counts, not for keeping them up to date.
     */
    public function refreshAll(): void
    {
        // One grouped query reads the tables in a single pass. Counting tag by tag looks every
        // discussion up separately, which took over ten times as long on two million discussions.
        $counts = $this->db->table('discussions')
            ->join('discussion_tag', 'discussion_tag.discussion_id', '=', 'discussions.id')
            ->where('discussions.is_private', false)
            ->whereNull('discussions.hidden_at')
            ->groupBy('discussion_tag.tag_id')
            ->selectRaw('discussion_tag.tag_id, SUM(discussions.comment_count) AS post_count')
            ->pluck('post_count', 'tag_id');

        foreach ($this->db->table('tags')->pluck('id') as $tagId) {
            $this->db->table('tags')
                ->where('id', $tagId)
                ->update(['post_count' => (int) ($counts[$tagId] ?? 0)]);
        }
    }
}
