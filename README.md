# Categories by FriendsOfFlarum

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/fof/categories.svg)](https://packagist.org/packages/fof/categories) [![Total Downloads](https://img.shields.io/packagist/dt/fof/categories.svg)](https://packagist.org/packages/fof/categories) [![OpenCollective](https://img.shields.io/badge/opencollective-fof-blue.svg)](https://opencollective.com/fof/donate)

A [Flarum](http://flarum.org) extension. Traditional category layout for Flarum.

## Desktop
![On Desktop](https://cdn.discuss.flarum.org/2026-10-14/1791969653-607925-image.png)

## Mobile
![On Mobile](https://cdn.discuss.flarum.org/2026-10-14/1791969712-681220-image.png)

### Installation

Install with composer:

```sh
composer require fof/categories:"*"
```

### Updating

```sh
composer update fof/categories
php flarum migrate
php flarum cache:clear
```

### Post counts

Each category shows how many posts it has. The count leaves out hidden and private discussions, like the discussion count next to it, and is kept up to date as posts are made, hidden, restored and deleted.

The posts already on your forum are counted once, during `php flarum migrate`. To count them again, for example after importing discussions directly into the database, run:

```sh
php flarum fof:categories:recount
```

It reads every tagged discussion, so on a very large forum it can take a little while; two million discussions took about four seconds in testing.

If **Optimize for small forums** is enabled in the extension's settings, the counts are worked out live for each visitor instead, which gets slower as the forum grows.

### Links

[![OpenCollective](https://img.shields.io/badge/donate-friendsofflarum-44AEE5?style=for-the-badge&logo=open-collective)](https://opencollective.com/fof/donate)

- [Discuss](https://discuss.flarum.org/d/38778-friendsofflarum-categories)
- [Packagist](https://packagist.org/packages/fof/categories)
- [GitHub](https://github.com/FriendsOfFlarum/categories)
- [Issues](https://github.com/FriendsOfFlarum/categories/issues)

An extension by [FriendsOfFlarum](https://github.com/FriendsOfFlarum).