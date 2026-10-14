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

namespace FoF\Categories\Listener;

use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Deleted;
use Flarum\Discussion\Event\Started;
use Flarum\Tags\Event\DiscussionWasTagged;
use Flarum\Tags\Tag;
use FoF\Categories\PostCount;
use Illuminate\Contracts\Events\Dispatcher;

/**
 * Applies the change in a discussion's contribution to its tags' post counts, so each update
 * costs the same however many discussions a tag has.
 */
class UpdateTagPostCount
{
    public function __construct(
        protected PostCount $postCount
    ) {
    }

    public function subscribe(Dispatcher $events): void
    {
        // Core saves the discussion whenever a post is made, hidden, restored, deleted or approved,
        // and when the discussion itself is hidden, restored or made private.
        $events->listen(Started::class, $this->whenDiscussionIsStarted(...));
        $events->listen('eloquent.saved: '.Discussion::class, $this->whenDiscussionIsSaved(...));
        $events->listen(DiscussionWasTagged::class, $this->whenDiscussionWasTagged(...));
        $events->listen('eloquent.deleting: '.Discussion::class, $this->whenDiscussionIsDeleting(...));
        $events->listen(Deleted::class, $this->whenDiscussionIsDeleted(...));
    }

    /**
     * By now a new discussion's tags are attached and its first post is in its comment count.
     */
    public function whenDiscussionIsStarted(Started $event): void
    {
        $this->postCount->adjust($event->discussion->tags()->pluck('tags.id'), $this->contribution($event->discussion));
    }

    public function whenDiscussionIsSaved(Discussion $discussion): void
    {
        // Core saves a new discussion several times while creating it and its first post, before
        // its tags are attached. It is counted once, when it has been started.
        if ($discussion->wasRecentlyCreated) {
            return;
        }

        $delta = $this->contribution($discussion) - $this->contribution($discussion, $discussion->getPrevious());

        // Discussions are saved for many other reasons, so only look up the tags when it matters.
        if ($delta !== 0) {
            $this->postCount->adjust($discussion->tags()->pluck('tags.id'), $delta);
        }
    }

    public function whenDiscussionWasTagged(DiscussionWasTagged $event): void
    {
        $oldTagIds = array_map(fn (Tag $tag) => $tag->id, $event->oldTags);
        $newTagIds = $event->discussion->tags()->pluck('tags.id')->all();
        $contribution = $this->contribution($event->discussion);

        $this->postCount->adjust(array_diff($oldTagIds, $newTagIds), -$contribution);
        $this->postCount->adjust(array_diff($newTagIds, $oldTagIds), $contribution);
    }

    /**
     * Deleting a discussion deletes its rows in discussion_tag through a foreign key cascade,
     * so load its tags while they can still be found.
     */
    public function whenDiscussionIsDeleting(Discussion $discussion): void
    {
        $discussion->loadMissing('tags');
    }

    public function whenDiscussionIsDeleted(Deleted $event): void
    {
        $this->postCount->adjust($event->discussion->tags->pluck('id'), -$this->contribution($event->discussion));
    }

    /**
     * How many posts a discussion adds to its tags' counts, from its current attributes or,
     * overriding some of them, their values before the last save.
     *
     * @param array<string, mixed> $previous
     */
    protected function contribution(Discussion $discussion, array $previous = []): int
    {
        $attribute = fn (string $key) => array_key_exists($key, $previous) ? $previous[$key] : $discussion->getAttribute($key);

        if ($attribute('is_private') || $attribute('hidden_at') !== null) {
            return 0;
        }

        return (int) $attribute('comment_count');
    }
}
