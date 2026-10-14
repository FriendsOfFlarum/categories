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

use FoF\Categories\PostCount;
use Illuminate\Database\Schema\Builder;

// `post_count` was added empty, so posts made before the extension was enabled were never counted,
// and deletions never lowered it. Count every tag's posts afresh.
return [
    'up' => function (Builder $schema) {
        (new PostCount($schema->getConnection()))->refreshAll();
    },
    'down' => function (Builder $schema) {
        // The counts stay correct without this migration.
    },
];
