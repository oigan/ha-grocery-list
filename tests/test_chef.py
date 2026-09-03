"""Tests for Chef AI product safety and quantity matching."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from custom_components.auchan_grocery.api.chef import (
    match_recipe_products,
    package_quantity,
    product_match_score,
)
from custom_components.auchan_grocery.api.search import ProductSearchResult


def product(
    name: str, category: str = "Alimente", category_path: str = ""
) -> ProductSearchResult:
    return ProductSearchResult(
        sku_id="123",
        product_id="p123",
        name=name,
        category=category,
        category_path=category_path,
        price=9.99,
        quantity_available=10,
    )


def test_rejects_non_food_catalog_noise():
    assert product_match_score("iaurt grecesc", product("Uscător de păr Qilive")) == 0
    assert product_match_score("iaurt grecesc", product("Piscină rotundă Bestway")) == 0


def test_accepts_relevant_food_product():
    assert (
        product_match_score("iaurt grecesc", product("Iaurt grecesc Auchan 10% 400 g"))
        >= 0.45
    )


@pytest.mark.parametrize(
    ("query", "name"),
    [
        ("couscous", "Salată de ton cu couscous, 160 g"),
        ("ardei gras roșu", "Ardei iute roșu, 100 g"),
        ("lămâie", "Sare de lămâie Auchan, 8 g"),
        ("sare", "Sare de lămâie Auchan, 8 g"),
        ("dovlecel", "Amestec de legume pentru tigaie cu dovlecel, 400 g"),
        ("dovlecel", "Dovleac plăcintar, +/- 3 kg"),
        ("ceapă roșie", "Germeni de ceapă roșie BioVega, 50 g"),
        ("ulei de măsline", "Ulei de măsline cu trufe negre, 100 ml"),
    ],
)
def test_rejects_related_but_wrong_product_variants(query, name):
    assert product_match_score(query, product(name)) == 0


@pytest.mark.parametrize(
    ("query", "name"),
    [
        ("couscous", "Couscous Auchan, 500 g"),
        ("ardei gras roșu", "Ardei gras roșu, 500 g"),
        ("lămâie", "Lămâi, 500 g"),
        ("sare", "Sare de mare iodată, 1 kg"),
        ("dovlecel", "Dovlecei, +/- 1 kg"),
        ("usturoi granulat", "Usturoi granulat Auchan, 15 g"),
    ],
)
def test_accepts_requested_base_or_explicit_variant(query, name):
    assert product_match_score(query, product(name)) >= 0.45


def test_rejects_fresh_ingredient_from_processed_category():
    wrong_aisle = product(
        "Ardei gras roșu Auchan, 500 g",
        category="Conserve de legume",
        category_path="Băcănie/Conserve/Conserve de legume",
    )
    assert product_match_score("ardei gras roșu", wrong_aisle) == 0


def test_rejects_frozen_processed_product_for_fresh_ingredient():
    frozen = product(
        "Lămâie bio stoarsă congelată, 10 x 35 g",
        category="Fructe",
        category_path="Congelate/Legume și fructe/Fructe",
    )
    assert product_match_score("lămâie", frozen) == 0


def test_rejects_pantry_staple_from_canned_food_category():
    canned = product(
        "Couscous Auchan, 160 g",
        category="Conservă de pește",
        category_path="Băcănie/Conserve/Conservă de pește",
    )
    assert product_match_score("couscous", canned) == 0


def test_rejects_couscous_shaped_egg_pasta_category():
    pasta = product(
        "Cuscus cu 4 ouă, 500 g",
        category="Paste făinoase",
        category_path="Băcănie/Orez, paste și legume uscate/Paste făinoase",
    )
    assert product_match_score("cuscus", pasta) == 0


def test_accepts_fresh_produce_category():
    fresh = product(
        "Ardei gras roșu, 500 g",
        category="Legume proaspete",
        category_path="Fructe și legume/Legume proaspete",
    )
    assert product_match_score("ardei gras roșu", fresh) >= 0.45


def test_explicit_processed_ingredient_can_use_condiments_category():
    granulated = product(
        "Usturoi granulat Auchan, 15 g",
        category="Condimente",
        category_path="Băcănie/Condimente",
    )
    assert product_match_score("usturoi granulat", granulated) >= 0.45


@pytest.mark.parametrize(
    ("required", "unit", "name", "expected"),
    [
        (750, "g", "Făină albă 1 kg", 1),
        (1200, "g", "Făină albă 500 g", 3),
        (1.5, "l", "Lapte integral 1 l", 2),
        (5, "buc", "Ouă mărimea M, 10 buc", 1),
    ],
)
def test_package_quantity(required, unit, name, expected):
    assert package_quantity(required, unit, name) == expected


@pytest.mark.asyncio
async def test_recipe_matching_keeps_only_relevant_candidates():
    search = AsyncMock()
    search.search.return_value = [
        product("Iaurt grecesc Auchan 400 g"),
        product("Uscător de păr Qilive"),
    ]

    result = await match_recipe_products(
        search,
        [
            {
                "name": "iaurt",
                "search_query": "iaurt grecesc",
                "quantity": 600,
                "unit": "g",
            }
        ],
        "v2.region",
    )

    assert [item["name"] for item in result[0]["matches"]] == [
        "Iaurt grecesc Auchan 400 g"
    ]
    assert result[0]["matches"][0]["suggested_packages"] == 2


@pytest.mark.asyncio
async def test_recipe_matching_uses_safe_curated_alias_after_no_match():
    search = AsyncMock()
    search.search.side_effect = [
        [product("Sare de lămâie Auchan, 8 g")],
        [product("Lămâi, 500 g")],
    ]

    result = await match_recipe_products(
        search,
        [{"name": "lămâie", "search_query": "lămâie", "quantity": 1, "unit": "buc"}],
        "v2.region",
    )

    assert result[0]["matches"][0]["name"] == "Lămâi, 500 g"
    assert result[0]["matches"][0]["match_query"] == "lamai"


@pytest.mark.asyncio
async def test_recipe_matching_ranks_expected_category_first():
    search = AsyncMock()
    search.search.return_value = [
        product("Ardei gras roșu", category="Alimente"),
        product(
            "Ardei gras roșu",
            category="Legume proaspete",
            category_path="Fructe și legume/Legume proaspete",
        ),
    ]

    result = await match_recipe_products(
        search,
        [{"name": "ardei", "search_query": "ardei gras roșu"}],
        "v2.region",
    )

    assert result[0]["matches"][0]["category"] == "Legume proaspete"
    search.search.assert_awaited_once_with(
        "ardei gras roșu", region_id="v2.region", count=20
    )


@pytest.mark.asyncio
async def test_recipe_matching_uses_catalog_spelling_for_plain_couscous():
    search = AsyncMock()
    search.search.side_effect = [
        [
            product(
                "Salată de ton cu couscous, 160 g",
                category_path="Băcănie/Conserve/Conservă de pește",
            )
        ],
        [
            product(
                "Cuscus Auchan, 500 g",
                category="Quinoa, bulgur și cus-cus",
                category_path="Băcănie/Orez, paste și legume uscate/Quinoa, bulgur și cus-cus",
            )
        ],
    ]

    result = await match_recipe_products(
        search,
        [{"name": "couscous", "search_query": "couscous"}],
        "v2.region",
    )

    assert result[0]["matches"][0]["name"] == "Cuscus Auchan, 500 g"
    assert result[0]["matches"][0]["match_query"] == "cuscus"
