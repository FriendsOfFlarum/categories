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

class Util
{
    /**
     * @param \Flarum\Post\Post|null $post
     * @param int                    $delta
     */
    public static function updateTagsPostCount($post, $delta): void
    {
        if (! $post) {
            return;
        }

        foreach ($post->discussion->tags as $tag) {
            // We do not count private discussions in tags
            if (! $post->is_private && ! $post->discussion->is_private) {
                // `post_count` is added to the `tags` table by this extension's
                // migration, so it is not a declared property on core's Tag model.
                $tag->setAttribute('post_count', (int) $tag->getAttribute('post_count') + $delta);
            }

            $tag->save();
        }
    }
}
