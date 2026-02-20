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

namespace FoF\Categories\Content;

use Flarum\Api\Client;
use Flarum\Frontend\Document;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\TranslatorInterface;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\TagRepository;
use Illuminate\Contracts\View\Factory;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;

class Categories
{
    public function __construct(protected Client $api, protected Factory $view, protected TagRepository $tags, protected TranslatorInterface $translator, protected SettingsRepositoryInterface $settings, protected UrlGenerator $url)
    {
    }

    public function __invoke(Document $document, Request $request)
    {
        $apiDocument = $this->getTagsDocument($request);
        $tags = collect(Arr::get($apiDocument, 'data', []));

        $childTags = $tags->where('attributes.isChild', true);
        $primaryTags = $tags->where('attributes.isChild', false)->where('attributes.position', '!==', null)->sortBy('attributes.position');
        $secondaryTags = $tags->where('attributes.isChild', false)->where('attributes.position', '===', null)->sortBy('attributes.name');

        $children = $primaryTags->mapWithKeys(function ($tag) use ($childTags) {
            $childIds = collect(Arr::get($tag, 'relationships.children.data'))->pluck('id');

            return [$tag['id'] => $childTags->whereIn('id', $childIds)->sortBy('position')];
        });

        $defaultRoute = $this->settings->get('default_route');
        $document->title = $this->translator->trans('fof-categories.forum.all_categories.meta_title_text');
        $document->meta['description'] = $this->translator->trans('fof-categories.forum.all_categories.meta_description_text');
        $document->content = $this->view->make('tags::frontend.content.tags', compact('primaryTags', 'secondaryTags', 'children'));
        $document->canonicalUrl = $defaultRoute === '/categories' ? $this->url->to('forum')->base() : $request->getUri()->withQuery('');
        $document->payload['apiDocument'] = $apiDocument;

        return $document;
    }

    private function getTagsDocument(Request $request)
    {
        return json_decode($this->api->withoutErrorHandling()->withParentRequest($request)->withQueryParams([
            'include' => 'children,parent,lastPostedDiscussion,lastPostedDiscussion.lastPostedUser',
        ])->get('/tags')->getBody(), true);
    }
}
