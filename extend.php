<?php

/*
 * This file is part of fof/categories
 *
 *  Copyright (c) FriendsOfFlarum.
 *
 *  For detailed copyright and license information, please view the
 *  LICENSE file that was distributed with this source code.
 */

namespace FoF\Categories;

use FoF\Categories\Content\Categories;
use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Extend;
use Flarum\Post\Event\Hidden;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Restored;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Api\Controller\ListTagsController;
use Flarum\Tags\Api\Serializer\TagSerializer;

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

    (new Extend\ApiController(ListTagsController::class))
        ->addOptionalInclude('lastPostedDiscussion.lastPostedUser'),

    (new Extend\ApiSerializer(TagSerializer::class))
        ->attributes(function ($serializer, $model, $attributes) {
            $settings = resolve(SettingsRepositoryInterface::class);
            if ($settings->get('fof-categories.small-forum-optimized', false)) {
                $result = $model->discussions()
                    ->selectRaw('sum(comment_count) as postCount, count(id) as discussionCount')
                    ->whereVisibleTo($serializer->getActor())
                    ->get()[0];
                $attributes['discussionCount'] = (int) $result['discussionCount'];
                $attributes['postCount'] = (int) $result['postCount'];
            } else {
                // discussion count is loaded this way by default, no need to reiterate
                $attributes['postCount'] = (int) $model->post_count;
            }

            return $attributes;
        }),

    (new Extend\ApiSerializer(BasicUserSerializer::class))
        ->attribute('joinTime', function ($serializer, $model) {
            return $serializer->formatDate($model->joined_at);
        }),

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
