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

namespace FoF\Categories\Console;

use Flarum\Console\AbstractCommand;
use FoF\Categories\PostCount;
use Symfony\Component\Console\Command\Command;

class RecountPostsCommand extends AbstractCommand
{
    public function __construct(
        protected PostCount $postCount
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setName('fof:categories:recount')
            ->setDescription('Recount the posts in every tag, shown on the categories page');
    }

    protected function fire(): int
    {
        $this->info('Recounting the posts in every tag...');

        $this->postCount->refreshAll();

        $this->info('Done.');

        return Command::SUCCESS;
    }
}
