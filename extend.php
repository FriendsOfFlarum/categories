<?php

/*
 * This file is part of fof/categories
 *  *
 *  *  Copyright (c) 2021 Alexander Skvortsov.
 *  *  Copyright (c) 2025 FriendsOfFlarum.
 *  *
 *  *  For detailed copyright and license information, please view the
 *  *  LICENSE file that was distributed with this source code.
 */

namespace FoF\Categories;

use Flarum\Api\Context;
use Flarum\Api\Resource\UserResource;
use Flarum\Api\Schema;
use Flarum\Extend;
use Flarum\Post\Event\Hidden;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Restored;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Api\Resource\TagResource;
use FoF\Categories\Content\Categories;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less')
        ->route('/categories', 'categories', Categories::class),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/resources/less/admin.less'),

    (new Extend\Settings())
        ->serializeToForum('categories.keepTagsNav', 'fof-categories.keep-tags-nav', 'boolval')
        ->serializeToForum('categories.fullPageDesktop', 'fof-categories.full-page-desktop', 'boolval')
        ->serializeToForum('categories.compactMobile', 'fof-categories.compact-mobile', 'boolval')
        ->serializeToForum('categories.parentRemoveIcon', 'fof-categories.parent-remove-icon', 'boolval')
        ->serializeToForum('categories.parentRemoveDescription', 'fof-categories.parent-remove-description', 'boolval')
        ->serializeToForum('categories.parentRemoveStats', 'fof-categories.parent-remove-stats', 'boolval')
        ->serializeToForum('categories.parentRemoveLastDiscussion', 'fof-categories.parent-remove-last-discussion', 'boolval')
        ->serializeToForum('categories.childBareIcon', 'fof-categories.child-bare-icon', 'boolval', true),

    (new Extend\ApiResource(TagResource::class))
            ->fields(fn () => [
                Schema\Integer::make('postCount')
                    ->get(function (\Flarum\Tags\Tag $tag, Context $context) {
                        $settings = resolve(SettingsRepositoryInterface::class);
                        if ($settings->get('fof-categories.small-forum-optimized', false)) {
                            return (int) $tag->discussions()
                                ->whereVisibleTo($context->getActor())
                                ->sum('comment_count');
                        }

                        return (int) $tag->post_count;
                    }),
                Schema\Integer::make('discussionCount')
                    ->get(function (\Flarum\Tags\Tag $tag, Context $context) {
                        $settings = resolve(SettingsRepositoryInterface::class);
                        if ($settings->get('fof-categories.small-forum-optimized', false)) {
                            return (int) $tag->discussions()
                                ->whereVisibleTo($context->getActor())
                                ->count();
                        }

                        return (int) $tag->discussion_count;
                    }),
            ]),

    (new Extend\ApiResource(UserResource::class))
            ->fields(fn () => [
                Schema\DateTime::make('joinTime')
                    ->property('joined_at'),
            ]),

    new Extend\Locales(__DIR__.'/resources/locale'),

    (new Extend\Event())
        ->listen(Hidden::class, function (Hidden $event) {
            Util::updateTagsPostCount($event->post, -1);
        })
        ->listen(Posted::class, function (Posted $event) {
            Util::updateTagsPostCount($event->post, 1);
        })
        ->listen(Restored::class, function (Restored $event) {
            Util::updateTagsPostCount($event->post, 1);
        }),
];
