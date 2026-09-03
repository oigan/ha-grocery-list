"""Recipe parser regression tests for current and legacy Auchan markup."""

from bs4 import BeautifulSoup

import pytest

from custom_components.auchan_grocery.api.recipes import (
    AuchanRecipeScraper,
    Recipe,
    RecipeIngredient,
    RecipeFetchError,
    _read_limited_response,
    select_importable_recipe_products,
)


class _ChunkedContent:
    def __init__(self, chunks: list[bytes]) -> None:
        self._chunks = chunks

    async def iter_chunked(self, _size: int):
        for chunk in self._chunks:
            yield chunk


class _ChunkedResponse:
    def __init__(self, chunks: list[bytes]) -> None:
        self.content = _ChunkedContent(chunks)


@pytest.mark.asyncio
async def test_limited_reader_collects_every_network_chunk() -> None:
    response = _ChunkedResponse([b"prima ", b"a doua ", b"a treia"])

    payload = await _read_limited_response(response, 64)  # type: ignore[arg-type]

    assert payload == b"prima a doua a treia"


@pytest.mark.asyncio
async def test_limited_reader_rejects_oversized_response() -> None:
    response = _ChunkedResponse([b"1234", b"5678"])

    with pytest.raises(RecipeFetchError, match="too large"):
        await _read_limited_response(response, 7)  # type: ignore[arg-type]


def test_parses_current_break_separated_ingredients() -> None:
    html = """
    <div class="vtex-rich-text-0-x-wrapper--modularTextCol">
      <h2>Ingrediente</h2>
      <p>250 ml lapte<br>125 g făină cernută<br>Un praf de sare</p>
      <h2>Mod de preparare</h2>
      <p>Se amestecă ingredientele.</p>
    </div>
    """
    recipe = Recipe(
        id="test", title="Test", url="https://www.auchan.ro/inspiratie-si-savoare/test"
    )

    AuchanRecipeScraper(None)._parse_detail(html, recipe)  # type: ignore[arg-type]

    assert [item.name for item in recipe.ingredients] == [
        "lapte",
        "făină cernută",
        "Un praf de sare",
    ]
    assert recipe.ingredients[0].quantity == "250"
    assert recipe.ingredients[0].unit == "ml"


def test_parses_legacy_list_ingredients() -> None:
    html = """
    <h2>Ingrediente</h2>
    <ul class="vtex-rich-text-0-x-list--blogArticleContent">
      <li>2 ouă</li><li>100 g zahăr</li>
    </ul>
    """
    recipe = Recipe(
        id="test", title="Test", url="https://www.auchan.ro/inspiratie-si-savoare/test"
    )

    AuchanRecipeScraper(None)._parse_detail(html, recipe)  # type: ignore[arg-type]

    assert [item.name for item in recipe.ingredients] == ["ouă", "zahăr"]


def test_product_slider_is_the_recipe_import_source() -> None:
    html = r"""
    <h2>Ingrediente</h2>
    <p>1 litru de lapte<br>5 ouă</p>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Product",
            "@id": "https://www.auchan.ro/lapte-bio/p",
            "name": "Lapte BIO, 1.5 l",
            "brand": {"@type": "Brand", "name": "Napolact"},
            "image": "https://auchan.vtexassets.com/arquivos/ids/1/lapte.jpg",
            "sku": "427486",
            "offers": {"@type": "AggregateOffer", "lowPrice": 16.99}
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Product",
            "@id": "https://www.auchan.ro/oua-eco/p",
            "name": "Ouă ECO, 10 bucăți",
            "image": "https://auchan.vtexassets.com/arquivos/ids/2/oua.jpg",
            "sku": "149369",
            "offers": {"@type": "AggregateOffer", "lowPrice": 18.99}
          }
        }
      ]
    }
    </script>
    <script>
      {"contentJSON":"{\"collection\":\"9991\"}","treePath":"vtex.store@2.x:store.custom#inspiratie-si-savoare-retete-cu-razvan-exarhu-gris-cu-lapte/toggle-layout#slider/list-context.product-list#slider"}
    </script>
    """
    recipe = Recipe(
        id="gris",
        title="Griș cu lapte",
        url=(
            "https://www.auchan.ro/inspiratie-si-savoare/"
            "retete-cu-razvan-exarhu/gris-cu-lapte"
        ),
    )

    AuchanRecipeScraper(None)._parse_detail(html, recipe)  # type: ignore[arg-type]

    assert recipe.collection_id == "9991"
    assert [item.sku_id for item in recipe.ingredients] == ["427486", "149369"]
    assert [item.name for item in recipe.ingredients] == [
        "Lapte BIO, 1.5 l",
        "Ouă ECO, 10 bucăți",
    ]
    assert recipe.ingredients[0].brand == "Napolact"
    assert recipe.ingredients[0].price == 16.99
    assert recipe.ingredients[0].found is True


def test_product_slider_rejects_untrusted_product_assets() -> None:
    html = """
    <script type="application/ld+json">
    {
      "@type": "ItemList",
      "itemListElement": [{
        "item": {
          "@type": "Product",
          "@id": "https://example.com/not-auchan/p",
          "name": "Produs extern",
          "image": "https://example.com/tracker.gif",
          "sku": "sku-1"
        }
      }]
    }
    </script>
    """

    items = AuchanRecipeScraper._extract_slider_products(
        BeautifulSoup(html, "html.parser")
    )

    assert len(items) == 1
    assert items[0].url == ""
    assert items[0].image_url == ""


def test_reader_slider_products_seed_exact_collection_lookup() -> None:
    markdown = """
    ## Ingrediente

    1 litru de lapte

    ## Adaugă ingredientele în coș

    [![Image 1: Bio](https://auchan.vtexassets.com/arquivos/bio.svg) Bio ![Image 2: Lapte BIO Napolact](https://auchan.vtexassets.com/arquivos/ids/284009-300-300?v=1) Lapte BIO Napolact In stoc 16,99 lei](http://www.auchan.ro/lapte-bio-napolact/p)

    ## Mod de preparare

    Fierbe laptele.
    """
    recipe = Recipe(
        id="reader-products",
        title="Griș cu lapte",
        url="https://www.auchan.ro/inspiratie-si-savoare/test",
    )

    AuchanRecipeScraper(None)._parse_reader_markdown(  # type: ignore[arg-type]
        markdown, recipe
    )

    assert len(recipe.ingredients) == 1
    assert recipe.ingredients[0].name == "Lapte BIO Napolact"
    assert recipe.ingredients[0].price == 16.99
    assert recipe.ingredients[0].url == ("https://www.auchan.ro/lapte-bio-napolact/p")
    assert "/arquivos/ids/284009-300-300" in recipe.ingredients[0].image_url


def test_reader_markdown_uses_only_first_ingredient_section() -> None:
    markdown = """
    ![Rețetă](https://auchan.vtexassets.com/assets/recipe-hero.jpg)

    Ingrediente:

    *   200 g zahăr;
    *   4 ouă;
    *   1 l lapte.

    Mod de preparare:

    1. Fierbe laptele.

    Ingrediente:
    * 10 ouă
    """
    recipe = Recipe(
        id="test",
        title="Test",
        url="https://www.auchan.ro/inspiratie-si-savoare/test",
    )

    AuchanRecipeScraper(None)._parse_reader_markdown(  # type: ignore[arg-type]
        markdown, recipe
    )

    assert [item.name for item in recipe.ingredients] == ["zahăr", "ouă", "lapte"]
    assert recipe.ingredients[0].unit == "g"
    assert recipe.ingredients[2].unit == "l"
    assert recipe.image_url == ("https://auchan.vtexassets.com/assets/recipe-hero.jpg")


def test_reader_image_rejects_non_auchan_hosts() -> None:
    markdown = """
    [![Logo](https://auchan.vtexassets.com/assets/navigation-logo.png)](https://www.auchan.ro/)
    ![Extern](https://example.com/untrusted.jpg)
    ![Auchan](https://auchan.vtexassets.com/assets/recipe-safe.jpg)
    """

    image_url = AuchanRecipeScraper._extract_reader_image_url(markdown)

    assert image_url == "https://auchan.vtexassets.com/assets/recipe-safe.jpg"


async def test_missing_recipe_images_are_enriched_from_reader() -> None:
    recipes = [
        Recipe(
            id="missing",
            title="Missing",
            url="https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/missing",
        ),
        Recipe(
            id="existing",
            title="Existing",
            url="https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/existing",
            image_url="https://auchan.vtexassets.com/assets/existing.jpg",
        ),
    ]
    scraper = AuchanRecipeScraper(None)  # type: ignore[arg-type]
    requested_urls: list[str] = []

    async def fetch_thumbnail(url: str) -> str:
        requested_urls.append(url)
        return "https://auchan.vtexassets.com/assets/enriched.jpg"

    scraper._fetch_recipe_thumbnail_url = fetch_thumbnail  # type: ignore[method-assign]

    await scraper._enrich_missing_images(recipes)

    assert requested_urls == [recipes[0].url]
    assert recipes[0].image_url.endswith("/enriched.jpg")
    assert recipes[1].image_url.endswith("/existing.jpg")


@pytest.mark.asyncio
async def test_recipe_detail_uses_reader_when_direct_page_is_too_large() -> None:
    recipe = Recipe(
        id="reader-fallback",
        title="Griș cu lapte",
        url="https://www.auchan.ro/inspiratie-si-savoare/test",
    )
    scraper = AuchanRecipeScraper(None)  # type: ignore[arg-type]

    async def oversized_page(_url: str) -> str:
        raise RecipeFetchError("Recipe response is too large")

    async def reader_page(_url: str) -> str:
        return """
        ## Adaugă ingredientele în coș

        [![Image 1: Lapte BIO](https://auchan.vtexassets.com/arquivos/ids/1-300-300) Lapte BIO In stoc 10,00 lei](https://www.auchan.ro/lapte-bio/p)

        ## Mod de preparare
        """

    scraper._fetch_html = oversized_page  # type: ignore[method-assign]
    scraper._fetch_reader_markdown = reader_page  # type: ignore[method-assign]

    result = await scraper.get_recipe_detail(recipe)

    assert result.detail_fetched is True
    assert [item.name for item in result.ingredients] == ["Lapte BIO"]
    assert result.ingredients[0].url == "https://www.auchan.ro/lapte-bio/p"


@pytest.mark.asyncio
async def test_listing_uses_reader_when_direct_page_is_too_large() -> None:
    scraper = AuchanRecipeScraper(None)  # type: ignore[arg-type]

    async def oversized_page(_url: str) -> str:
        raise RecipeFetchError("Recipe response is too large")

    async def reader_page(_url: str) -> str:
        return """
        Rețetă cu fotografie

        Descriere.

        [![Află mai multe](https://auchan.vtexassets.com/assets/recipe.jpg)](https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/reteta-cu-fotografie)
        """

    scraper._fetch_html = oversized_page  # type: ignore[method-assign]
    scraper._fetch_reader_markdown = reader_page  # type: ignore[method-assign]

    recipes = await scraper._fetch_listing(
        "https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini", 12
    )

    assert len(recipes) == 1
    assert recipes[0].title == "Rețetă cu fotografie"
    assert recipes[0].image_url.endswith("/recipe.jpg")


def test_only_verified_slider_products_are_importable() -> None:
    textual_ingredient = RecipeIngredient(name="4 litri de apă", raw="4 litri de apă")
    exact_product = RecipeIngredient(
        name="Lapte BIO",
        sku_id="427486",
        product_id="427486",
        found=True,
    )

    assert select_importable_recipe_products([textual_ingredient, exact_product]) == [
        exact_product
    ]
    assert (
        select_importable_recipe_products(
            [textual_ingredient, exact_product], {"other-sku"}
        )
        == []
    )


def test_ingredient_units_do_not_consume_name_prefixes() -> None:
    scraper = AuchanRecipeScraper(None)  # type: ignore[arg-type]

    spoon = scraper._parse_ingredient_text("1 lingură coajă rasă")
    sachets = scraper._parse_ingredient_text("2 pliculețe de zahăr vanilat")

    assert (spoon.unit, spoon.name) == ("lingură", "coajă rasă")
    assert (sachets.unit, sachets.name) == ("pliculețe", "de zahăr vanilat")


def test_listing_falls_back_to_embedded_vtex_routes() -> None:
    html = r"""
    <script>
      {"path":"\u002Finspiratie-si-savoare\u002Fretete-cu-razvan-exarhu\u002Fkaiserschmarrn"}
      {"path":"\u002Finspiratie-si-savoare\u002Fretete-cu-razvan-exarhu\u002Flapte-fript-cu-dulceata"}
    </script>
    """

    recipes = AuchanRecipeScraper(None)._parse_listing(html, 12)  # type: ignore[arg-type]

    assert [recipe.title for recipe in recipes] == [
        "Kaiserschmarrn",
        "Lapte Fript Cu Dulceata",
    ]
    assert all(recipe.url.startswith("https://www.auchan.ro/") for recipe in recipes)


def test_parses_reader_listing_cards_with_official_thumbnails() -> None:
    markdown = """
    Markdown Content:
    Salată grecească: rețetă simplă

    O masă ușoară cu ingrediente proaspete.

    [![Image 1: AFLĂ MAI MULTE](https://auchan.vtexassets.com/assets/salata.webp)](https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/reteta-salata-greceasca)

    Lasagna cu sos bechamel

    Un preparat cald pentru mesele în familie.

    [![Image 2: AFLĂ MAI MULTE](https://auchan.vtexassets.com/assets/lasagna.jpg)](http://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/reteta-lasagna)

    [![Logo](https://auchan.vtexassets.com/assets/logo.png)](https://www.auchan.ro/)
    """

    recipes = AuchanRecipeScraper(None)._parse_reader_listing(  # type: ignore[arg-type]
        markdown, 12
    )

    assert [recipe.title for recipe in recipes] == [
        "Salată grecească: rețetă simplă",
        "Lasagna cu sos bechamel",
    ]
    assert all(
        recipe.image_url.startswith("https://auchan.vtexassets.com/")
        for recipe in recipes
    )
    assert recipes[1].url.startswith("https://www.auchan.ro/")


def test_parses_recipe_urls_from_custom_route_sitemap() -> None:
    xml = """
    <urlset>
      <url><loc>https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini/lapte-de-pasare</loc></url>
      <url><loc>https://www.auchan.ro/produs-nepermis/p</loc></url>
      <url><loc>https://www.auchan.ro/inspiratie-si-savoare/retete-cu-razvan-exarhu/meat-loaf</loc></url>
    </urlset>
    """

    recipes = AuchanRecipeScraper._parse_sitemap(xml, 12)

    assert [recipe.title for recipe in recipes] == ["Lapte De Pasare", "Meat Loaf"]
