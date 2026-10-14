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
use Flarum\Testing\integration\ConsoleTestCase;
use PHPUnit\Framework\Attributes\Test;

class RecountPostsCommandTest extends ConsoleTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('flarum-tags', 'fof-categories');

        $this->prepareDatabase([
            'tags' => [
                ['id' => 1, 'name' => 'General', 'slug' => 'general', 'position' => 0, 'post_count' => 99],
                ['id' => 2, 'name' => 'Empty', 'slug' => 'empty', 'position' => 1, 'post_count' => 5],
            ],
            'discussions' => [
                ['id' => 1, 'title' => 'Counted', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'comment_count' => 3],
                ['id' => 2, 'title' => 'Private', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'comment_count' => 4, 'is_private' => true],
            ],
            'discussion_tag' => [
                ['discussion_id' => 1, 'tag_id' => 1],
                ['discussion_id' => 2, 'tag_id' => 1],
            ],
        ]);
    }

    #[Test]
    public function it_recounts_every_tag()
    {
        $output = $this->runCommand(['command' => 'fof:categories:recount']);

        $this->assertStringContainsString('Done.', $output);
        $this->assertSame(3, (int) $this->database()->table('tags')->where('id', 1)->value('post_count'));
        // A tag without discussions is set to zero, not left as it was.
        $this->assertSame(0, (int) $this->database()->table('tags')->where('id', 2)->value('post_count'));
    }
}
