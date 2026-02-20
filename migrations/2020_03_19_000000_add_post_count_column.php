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

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (! $schema->hasColumn('tags', 'post_count')) {
            $schema->table('tags', function (Blueprint $table) {
                $table->integer('post_count')->unsigned()->default(0);
            });
        }
    },

    'down' => function (Builder $schema) {
        if ($schema->hasColumn('tags', 'post_count')) {
            $schema->table('tags', function (Blueprint $table) {
                $table->dropColumn('post_count');
            });
        }
    },
];
