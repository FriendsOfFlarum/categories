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

namespace FoF\Categories\Tests\integration;

use Carbon\Carbon;
use FoF\Categories\PostCount;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

class PostCountTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('flarum-tags', 'fof-categories');

        $this->prepareDatabase([
            'users' => [$this->normalUser()],
            'tags' => [
                ['id' => 1, 'name' => 'General', 'slug' => 'general', 'position' => 0],
                ['id' => 2, 'name' => 'Other', 'slug' => 'other', 'position' => 1],
            ],
            'discussions' => [
                // Two comments, counted in General.
                ['id' => 1, 'title' => 'Counted', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 1, 'last_post_id' => 2, 'last_post_number' => 2, 'comment_count' => 2],
                // One comment, counted in Other.
                ['id' => 2, 'title' => 'Elsewhere', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 3, 'last_post_id' => 3, 'last_post_number' => 1, 'comment_count' => 1],
                // Private and hidden discussions are never counted, as for the tag's discussion count.
                ['id' => 3, 'title' => 'Private', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 4, 'last_post_id' => 4, 'last_post_number' => 1, 'comment_count' => 1, 'is_private' => true],
                ['id' => 4, 'title' => 'Hidden', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 5, 'last_post_id' => 5, 'last_post_number' => 1, 'comment_count' => 1, 'hidden_at' => Carbon::now()],
            ],
            'posts' => [
                ['id' => 1, 'discussion_id' => 1, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>First</p></t>'],
                ['id' => 2, 'discussion_id' => 1, 'number' => 2, 'created_at' => Carbon::now(), 'user_id' => 2, 'type' => 'comment', 'content' => '<t><p>Second</p></t>'],
                ['id' => 3, 'discussion_id' => 2, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>Other</p></t>'],
                ['id' => 4, 'discussion_id' => 3, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>Private</p></t>', 'is_private' => true],
                ['id' => 5, 'discussion_id' => 4, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>Hidden</p></t>'],
            ],
            'discussion_tag' => [
                ['discussion_id' => 1, 'tag_id' => 1],
                ['discussion_id' => 2, 'tag_id' => 2],
                ['discussion_id' => 3, 'tag_id' => 1],
                ['discussion_id' => 4, 'tag_id' => 1],
            ],
        ]);
    }

    /**
     * Boot with every tag counted correctly, as the backfill migration leaves them.
     */
    protected function bootCounted(): void
    {
        $this->app();
        (new PostCount($this->database()))->refreshAll();
    }

    protected function postCount(int $tagId): int
    {
        return (int) $this->database()->table('tags')->where('id', $tagId)->value('post_count');
    }

    protected function api(string $method, string $path, array $json = []): int
    {
        return $this->send($this->request($method, $path, ['authenticatedAs' => 1, 'json' => $json]))->getStatusCode();
    }

    #[Test]
    public function the_backfill_counts_existing_posts()
    {
        $this->app();
        // As on a forum that had posts before the count was kept.
        $this->database()->table('tags')->update(['post_count' => 0]);

        $migration = require __DIR__.'/../../migrations/2026_10_14_000000_backfill_tags_post_count.php';
        $migration['up']($this->database()->getSchemaBuilder());

        $this->assertSame(2, $this->postCount(1));
        $this->assertSame(1, $this->postCount(2));
    }

    #[Test]
    public function a_reply_is_counted()
    {
        $this->bootCounted();

        $this->assertSame(201, $this->api('POST', '/api/posts', [
            'data' => ['type' => 'posts', 'attributes' => ['content' => 'A reply'], 'relationships' => ['discussion' => ['data' => ['type' => 'discussions', 'id' => '1']]]],
        ]));

        $this->assertSame(3, $this->postCount(1));
    }

    #[Test]
    public function a_new_discussion_is_counted()
    {
        $this->bootCounted();

        $this->assertSame(201, $this->api('POST', '/api/discussions', [
            'data' => ['type' => 'discussions', 'attributes' => ['title' => 'New', 'content' => 'Hello'], 'relationships' => ['tags' => ['data' => [['type' => 'tags', 'id' => '2']]]]],
        ]));

        $this->assertSame(2, $this->postCount(2));
    }

    #[Test]
    public function hiding_and_restoring_a_post_updates_the_count()
    {
        $this->bootCounted();

        $this->assertSame(200, $this->api('PATCH', '/api/posts/2', ['data' => ['type' => 'posts', 'id' => '2', 'attributes' => ['isHidden' => true]]]));
        $this->assertSame(1, $this->postCount(1));

        $this->assertSame(200, $this->api('PATCH', '/api/posts/2', ['data' => ['type' => 'posts', 'id' => '2', 'attributes' => ['isHidden' => false]]]));
        $this->assertSame(2, $this->postCount(1));
    }

    #[Test]
    public function deleting_a_post_lowers_the_count()
    {
        $this->bootCounted();

        $this->assertSame(204, $this->api('DELETE', '/api/posts/2'));

        $this->assertSame(1, $this->postCount(1));
    }

    #[Test]
    public function hiding_and_restoring_a_discussion_updates_the_count()
    {
        $this->bootCounted();

        $this->assertSame(200, $this->api('PATCH', '/api/discussions/1', ['data' => ['type' => 'discussions', 'id' => '1', 'attributes' => ['isHidden' => true]]]));
        $this->assertSame(0, $this->postCount(1));

        $this->assertSame(200, $this->api('PATCH', '/api/discussions/1', ['data' => ['type' => 'discussions', 'id' => '1', 'attributes' => ['isHidden' => false]]]));
        $this->assertSame(2, $this->postCount(1));
    }

    #[Test]
    public function deleting_a_discussion_lowers_the_count()
    {
        $this->bootCounted();

        $this->assertSame(204, $this->api('DELETE', '/api/discussions/1'));

        $this->assertSame(0, $this->postCount(1));
    }

    #[Test]
    public function retagging_a_discussion_moves_its_posts()
    {
        $this->bootCounted();

        $this->assertSame(200, $this->api('PATCH', '/api/discussions/1', [
            'data' => ['type' => 'discussions', 'id' => '1', 'relationships' => ['tags' => ['data' => [['type' => 'tags', 'id' => '2']]]]],
        ]));

        $this->assertSame(0, $this->postCount(1));
        $this->assertSame(3, $this->postCount(2));
    }

    #[Test]
    public function a_count_that_was_already_wrong_does_not_go_below_zero()
    {
        $this->app();
        // As on a forum that hasn't run the backfill.
        $this->database()->table('tags')->update(['post_count' => 0]);

        $this->assertSame(204, $this->api('DELETE', '/api/discussions/1'));

        $this->assertSame(0, $this->postCount(1));
    }

    #[Test]
    public function private_and_hidden_discussions_are_not_counted()
    {
        $this->bootCounted();

        // Discussion 3 is private and 4 hidden; only discussion 1's two comments count.
        $this->assertSame(2, $this->postCount(1));

        $this->assertSame(201, $this->api('POST', '/api/posts', [
            'data' => ['type' => 'posts', 'attributes' => ['content' => 'Unseen'], 'relationships' => ['discussion' => ['data' => ['type' => 'discussions', 'id' => '4']]]],
        ]));

        $this->assertSame(2, $this->postCount(1));
    }

    #[Test]
    public function a_reply_does_not_recount_the_tag()
    {
        $this->bootCounted();
        $this->database()->enableQueryLog();

        $this->assertSame(201, $this->api('POST', '/api/posts', [
            'data' => ['type' => 'posts', 'attributes' => ['content' => 'A reply'], 'relationships' => ['discussion' => ['data' => ['type' => 'discussions', 'id' => '1']]]],
        ]));

        // Recounting reads every discussion in the tag, which is far too slow on a large forum.
        $queries = array_column($this->database()->getQueryLog(), 'query');
        $tagUpdates = array_filter($queries, fn (string $query) => preg_match('/^update [`"]?tags[`"]? set [`"]?post_count/i', $query));

        $this->assertEmpty(array_filter($queries, fn (string $query) => preg_match('/sum\([`"]?discussions[`"]?\.[`"]?comment_count/i', $query)));
        $this->assertCount(1, $tagUpdates);
        $this->assertSame(3, $this->postCount(1));
    }
}
