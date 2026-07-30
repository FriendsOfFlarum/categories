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

    public function __invoke(Document $document, Request $request): Document
    {
        $apiDocument = $this->getTagsDocument($request);
        $tags = collect($this->extractTags($apiDocument));

        $childTags = $tags->where('attributes.isChild', true);
        $primaryTags = $tags->where('attributes.isChild', false)->where('attributes.position', '!==', null)->sortBy('attributes.position');
        $secondaryTags = $tags->where('attributes.isChild', false)->where('attributes.position', '===', null)->sortBy('attributes.name');

        $children = $primaryTags->mapWithKeys(function (array $tag) use ($childTags) {
            $childIds = collect($this->extractRelated($tag, 'relationships.children.data'))->pluck('id');

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

    /**
     * @return array<string, mixed>
     */
    private function getTagsDocument(Request $request): array
    {
        $document = json_decode((string) $this->api->withoutErrorHandling()->withParentRequest($request)->withQueryParams([
            'include' => 'children,parent,lastPostedDiscussion,lastPostedDiscussion.lastPostedUser',
        ])->get('/tags')->getBody(), true);

        return is_array($document) ? $document : [];
    }

    /**
     * The top-level `data` member of the tags API document.
     *
     * @param array<string, mixed> $apiDocument
     *
     * @return array<int, array<string, mixed>>
     */
    private function extractTags(array $apiDocument): array
    {
        $tags = [];

        foreach (Arr::get($apiDocument, 'data', []) as $tag) {
            if (is_array($tag)) {
                $tags[] = $tag;
            }
        }

        return $tags;
    }

    /**
     * A resource-identifier list from a tag's relationships, e.g. its children.
     *
     * @param array<string, mixed> $tag
     *
     * @return array<int, array<string, mixed>>
     */
    private function extractRelated(array $tag, string $key): array
    {
        $related = [];

        foreach (Arr::get($tag, $key) ?? [] as $identifier) {
            if (is_array($identifier)) {
                $related[] = $identifier;
            }
        }

        return $related;
    }
}
