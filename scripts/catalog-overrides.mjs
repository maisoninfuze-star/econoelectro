/**
 * Manual, human-authored cleanup for the imported Hostinger catalog.
 *
 * The automated cleaner (clean-catalog.mjs) strips emojis, promotional text
 * and inconsistent casing, then detects brand / category / size / price
 * signals. These overrides add the copywritten bilingual titles, structured
 * fields and review notes. Original source data is never modified.
 *
 * Keys are the original Hostinger product ids.
 * Nothing here invents specifications: every field is traceable to the
 * original listing text or the product photos.
 */
export const overrides = {
  prod_01M28Z2HS3PXTJ83YR1PASAXPE: {
    title: { fr: "Réfrigérateur à portes françaises Samsung de 36 po", en: "Samsung 36-in. French-Door Refrigerator" },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Samsung",
    width: 36, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    priceFrom: true, purchasable: false, inventoryPolicy: "multiple",
    shortDescription: { fr: "Portes françaises, distributeur d'eau et de glaçons, congélateur inférieur.", en: "French doors, water and ice dispenser, bottom freezer." },
    description: {
      fr: "Réfrigérateur Samsung de 36 pouces à portes françaises offrant un style moderne et beaucoup d'espace de rangement. Fini en acier inoxydable, distributeur d'eau et de glaçons, intérieur spacieux et bien organisé, tablettes et compartiments pratiques, congélateur inférieur. Plusieurs unités offertes selon les stocks : le prix indiqué est un prix de départ, confirmé selon l'unité choisie.",
      en: "Samsung 36-inch French-door refrigerator with a modern look and generous storage. Stainless steel finish, water and ice dispenser, spacious well-organized interior, practical shelves and compartments, bottom freezer. Several units are offered depending on stock: the price shown is a starting price, confirmed for the unit you choose.",
    },
    specifications: [
      { label: { fr: "Type", en: "Type" }, value: { fr: "Portes françaises, congélateur inférieur", en: "French door, bottom freezer" } },
      { label: { fr: "Largeur", en: "Width" }, value: { fr: "36 po", en: "36 in." } },
      { label: { fr: "Distributeur", en: "Dispenser" }, value: { fr: "Eau et glaçons", en: "Water and ice" } },
    ],
    featured: true, badges: ["limited-stock"],
    reviewFlags: ["Annonce regroupant plusieurs unités (prix « à partir de »). À scinder en unités individuelles dans Shopify."],
  },
  prod_01M28X524NX3GAANQQAE1SNE85: {
    title: { fr: "Réfrigérateur à portes françaises LG de 33 po", en: "LG 33-in. French-Door Refrigerator" },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "LG",
    width: 33, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    priceFrom: true, purchasable: false, inventoryPolicy: "multiple",
    shortDescription: { fr: "Format standard de 33 po, congélateur inférieur, fini acier inoxydable.", en: "Standard 33-in. size, bottom freezer, stainless finish." },
    description: {
      fr: "Réfrigérateur LG à portes françaises de 33 pouces, parfait pour les espaces de format standard. Fini en acier inoxydable, intérieur spacieux et bien organisé, tablettes et rangements pratiques, congélateur inférieur. Plusieurs unités offertes selon les stocks : le prix indiqué est un prix de départ.",
      en: "LG 33-inch French-door refrigerator, ideal for standard-size spaces. Stainless steel finish, spacious well-organized interior, practical shelves and storage, bottom freezer. Several units are offered depending on stock: the price shown is a starting price.",
    },
    specifications: [
      { label: { fr: "Type", en: "Type" }, value: { fr: "Portes françaises, congélateur inférieur", en: "French door, bottom freezer" } },
      { label: { fr: "Largeur", en: "Width" }, value: { fr: "33 po", en: "33 in." } },
    ],
    featured: true, badges: ["limited-stock"],
    reviewFlags: ["Annonce regroupant plusieurs unités (prix « à partir de »). À scinder en unités individuelles dans Shopify."],
  },
  prod_01M28RWP4M74JEYYWFP100Z0V2: {
    title: { fr: "Réfrigérateur à portes françaises en acier inoxydable, format standard", en: "Stainless Steel French-Door Refrigerator, Standard Size" },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: null,
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    inventoryPolicy: "multiple", quantity: 2,
    shortDescription: { fr: "Format standard, grand espace de rangement, congélateur inférieur. Plusieurs modèles au même prix.", en: "Standard size, roomy interior, bottom freezer. Several models at the same price." },
    description: {
      fr: "Réfrigérateur à portes françaises en acier inoxydable, de format standard. Grand espace de rangement et congélateur inférieur pratique. Plusieurs modèles sont offerts au même prix selon les stocks disponibles; communiquez avec nous pour connaître les modèles en magasin et réserver le vôtre.",
      en: "Standard-size stainless steel French-door refrigerator with a roomy interior and a convenient bottom freezer. Several models are offered at the same price depending on stock; contact us to know which models are in store and reserve yours.",
    },
    specifications: [
      { label: { fr: "Type", en: "Type" }, value: { fr: "Portes françaises, congélateur inférieur", en: "French door, bottom freezer" } },
      { label: { fr: "Format", en: "Size" }, value: { fr: "Standard", en: "Standard" } },
    ],
    locationId: "vimont", badges: ["limited-stock"],
    reviewFlags: ["Marque non précisée (plusieurs modèles). Quantité exacte à confirmer (2 saisie par défaut d'après « plusieurs modèles »)."],
  },
  prod_01M28PXK35F71FXBGTC7EM0TGF: {
    title: { fr: "Réfrigérateur de format standard, marques variées", en: "Standard-Size Refrigerator, Assorted Brands" },
    category: "refrigerateurs", subcategory: "congelateur-haut", brand: null,
    inventoryPolicy: "multiple", quantity: 2,
    shortDescription: { fr: "Sélection de réfrigérateurs Whirlpool, Samsung, LG, GE, Frigidaire et KitchenAid, format standard.", en: "Selection of Whirlpool, Samsung, LG, GE, Frigidaire and KitchenAid standard-size refrigerators." },
    description: {
      fr: "Offre spéciale sur notre sélection de réfrigérateurs de format standard. Marques actuellement en stock : Whirlpool, Samsung, LG, GE, Frigidaire et KitchenAid. Quantités limitées; communiquez avec nous pour vérifier les modèles disponibles et réserver votre réfrigérateur.",
      en: "Special offer on our selection of standard-size refrigerators. Brands currently in stock: Whirlpool, Samsung, LG, GE, Frigidaire and KitchenAid. Limited quantities; contact us to check available models and reserve your refrigerator.",
    },
    specifications: [
      { label: { fr: "Format", en: "Size" }, value: { fr: "Standard", en: "Standard" } },
      { label: { fr: "Marques en stock", en: "Brands in stock" }, value: { fr: "Whirlpool, Samsung, LG, GE, Frigidaire, KitchenAid", en: "Whirlpool, Samsung, LG, GE, Frigidaire, KitchenAid" } },
    ],
    featured: true, badges: ["limited-stock"],
    reviewFlags: ["Annonce regroupant plusieurs unités de marques différentes. Sous-catégorie et quantité à confirmer."],
  },
  prod_01M28JE86K4JTJY5J9344AXA86: {
    title: { fr: "Ensemble laveuse et sécheuse, marques variées", en: "Washer and Dryer Set, Assorted Brands" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: null,
    inventoryPolicy: "multiple", quantity: 2,
    shortDescription: { fr: "Samsung, Maytag, GE ou LG, en blanc, gris ou acier inoxydable, selon les stocks.", en: "Samsung, Maytag, GE or LG, in white, grey or stainless, depending on stock." },
    description: {
      fr: "Choisissez la marque et la couleur qui vous conviennent parmi notre sélection en stock : Samsung, Maytag, GE ou LG, en blanc, gris ou acier inoxydable. Ensemble laveuse et sécheuse à prix réduit, plusieurs modèles disponibles jusqu'à épuisement des stocks.",
      en: "Choose the brand and colour that suit you from our in-stock selection: Samsung, Maytag, GE or LG, in white, grey or stainless steel. Washer and dryer set at a reduced price, several models available while supplies last.",
    },
    specifications: [
      { label: { fr: "Contenu", en: "Includes" }, value: { fr: "Laveuse et sécheuse", en: "Washer and dryer" } },
      { label: { fr: "Marques offertes", en: "Brands offered" }, value: { fr: "Samsung, Maytag, GE, LG", en: "Samsung, Maytag, GE, LG" } },
      { label: { fr: "Couleurs offertes", en: "Colours offered" }, value: { fr: "Blanc, gris, acier inoxydable", en: "White, grey, stainless steel" } },
    ],
    featured: true, sale: true,
    reviewFlags: ["Annonce regroupant plusieurs ensembles. Quantité exacte à confirmer."],
  },
  prod_01M1PZX7N9GBNYXSS3TSR17YJZ: {
    title: { fr: "Cuisinière électrique Whirlpool en acier inoxydable", en: "Whirlpool Stainless Steel Electric Range" },
    category: "cuisinieres", subcategory: "electrique", brand: "Whirlpool",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Surface de cuisson en vitrocéramique, finition moderne en acier inoxydable.", en: "Ceramic glass cooktop, modern stainless steel finish." },
    description: {
      fr: "Cuisinière électrique Whirlpool en acier inoxydable avec surface de cuisson en vitrocéramique. En stock à notre succursale de la rue Michelin.",
      en: "Whirlpool stainless steel electric range with a ceramic glass cooktop. In stock at our Michelin Street location.",
    },
    specifications: [
      { label: { fr: "Type", en: "Type" }, value: { fr: "Cuisinière électrique", en: "Electric range" } },
      { label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Vitrocéramique", en: "Ceramic glass" } },
    ],
    locationId: "vimont",
  },
  prod_01M1PYHXZMV63MMB504HY2DXPP: {
    title: { fr: "Cuisinière électrique en acier inoxydable", en: "Stainless Steel Electric Range" },
    category: "cuisinieres", subcategory: "electrique", brand: null,
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Design moderne en acier inoxydable, en stock à Laval.", en: "Modern stainless steel design, in stock in Laval." },
    description: {
      fr: "Cuisinière électrique au design moderne en acier inoxydable, en stock à notre succursale de la rue Michelin.",
      en: "Electric range with a modern stainless steel design, in stock at our Michelin Street location.",
    },
    specifications: [{ label: { fr: "Type", en: "Type" }, value: { fr: "Cuisinière électrique", en: "Electric range" } }],
    locationId: "vimont",
    reviewFlags: ["Nom d'origine « . ». La description mentionne « L2 » : marque et modèle à confirmer."],
  },
  prod_01M1PWAA4M535EC5FA84TXNHAM: {
    title: { fr: "Cuisinière Whirlpool à surface lisse en acier inoxydable", en: "Whirlpool Smooth-Top Stainless Steel Range" },
    category: "cuisinieres", subcategory: "electrique", brand: "Whirlpool",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Surface de cuisson lisse, four spacieux et propre, inspectée avant la vente.", en: "Smooth cooktop, roomy clean oven, inspected before sale." },
    description: {
      fr: "Cuisinière Whirlpool en acier inoxydable avec surface de cuisson lisse et four spacieux et propre. Qualité vérifiée et appareil inspecté avant la vente.",
      en: "Whirlpool stainless steel range with a smooth cooktop and a roomy, clean oven. Quality checked and inspected before sale.",
    },
    specifications: [
      { label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Lisse (vitrocéramique)", en: "Smooth (ceramic glass)" } },
    ],
    reviewFlags: ["Titre d'origine « induction », description « électrique » : type de surface à confirmer."],
  },
  prod_01M1PTS9B1KYNTSX65DCKF6KE0: {
    title: { fr: "Ensemble Samsung 4 appareils en acier inoxydable", en: "Samsung 4-Piece Stainless Steel Appliance Set" },
    category: "ensembles", subcategory: "4-appareils", brand: "Samsung",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Réfrigérateur, cuisinière, laveuse et sécheuse Samsung, vendus ensemble à prix réduit.", en: "Samsung refrigerator, range, washer and dryer, sold together at a reduced price." },
    description: {
      fr: "Équipez votre maison avec un ensemble complet d'électroménagers Samsung en acier inoxydable : réfrigérateur, cuisinière, laveuse et sécheuse. Prix des appareils vendus séparément : réfrigérateur 800 $, laveuse et sécheuse 800 $, cuisinière 450 $. Quantités limitées.",
      en: "Equip your home with a complete set of Samsung stainless steel appliances: refrigerator, range, washer and dryer. Prices when sold separately: refrigerator $800, washer and dryer $800, range $450. Limited quantities.",
    },
    includes: [
      { fr: "Réfrigérateur Samsung (800 $ séparément)", en: "Samsung refrigerator ($800 separately)" },
      { fr: "Laveuse et sécheuse Samsung (800 $ séparément)", en: "Samsung washer and dryer ($800 separately)" },
      { fr: "Cuisinière Samsung (450 $ séparément)", en: "Samsung range ($450 separately)" },
    ],
    locationId: "vimont", featured: true, sale: true,
  },
  prod_01M1A5CMFXV5TGEA2PMDKVPTNN: {
    title: { fr: "Cuisinière électrique Amana en acier inoxydable", en: "Amana Stainless Steel Electric Range" },
    category: "cuisinieres", subcategory: "electrique", brand: "Amana",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Surface vitrocéramique, commandes numériques du four, tiroir de rangement.", en: "Ceramic glass cooktop, digital oven controls, storage drawer." },
    description: {
      fr: "Cuisinière électrique Amana en acier inoxydable avec surface de cuisson en vitrocéramique facile à nettoyer et four spacieux. Commandes numériques du four et tiroir de rangement inférieur. Nettoyée et testée par notre équipe.",
      en: "Amana stainless steel electric range with an easy-to-clean ceramic glass cooktop and a spacious oven. Digital oven controls and bottom storage drawer. Cleaned and tested by our team.",
    },
    specifications: [
      { label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Vitrocéramique", en: "Ceramic glass" } },
      { label: { fr: "Commandes", en: "Controls" }, value: { fr: "Four à commandes numériques", en: "Digital oven controls" } },
      { label: { fr: "Rangement", en: "Storage" }, value: { fr: "Tiroir inférieur", en: "Bottom drawer" } },
    ],
  },
  prod_01M19YWPTKS0E08KW7RXX1KQ5W: {
    title: { fr: "Cuisinière électrique LG en acier inoxydable, intérieur bleu", en: "LG Stainless Steel Electric Range, Blue Interior" },
    category: "cuisinieres", subcategory: "electrique", brand: "LG",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Surface vitrée avec élément pont, commandes numériques, intérieur émaillé bleu LG.", en: "Glass cooktop with bridge element, digital controls, LG blue enamel interior." },
    description: {
      fr: "Cuisinière électrique LG en acier inoxydable munie d'une surface de cuisson vitrée avec élément pont, de commandes entièrement numériques et de l'intérieur de four émaillé bleu caractéristique de LG. Appareil d'occasion entièrement testé.",
      en: "LG stainless steel electric range with a glass cooktop featuring a bridge element, full digital controls and LG's signature blue enamel oven interior. Pre-owned unit, fully tested.",
    },
    specifications: [
      { label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Vitrée, avec élément pont", en: "Glass, with bridge element" } },
      { label: { fr: "Intérieur du four", en: "Oven interior" }, value: { fr: "Émail bleu", en: "Blue enamel" } },
    ],
    featured: true,
  },
  prod_01M19WVEYK2S8EEC397A31JBRV: {
    title: { fr: "Cuisinière électrique Whirlpool à four autonettoyant", en: "Whirlpool Electric Range with Self-Cleaning Oven" },
    category: "cuisinieres", subcategory: "electrique", brand: "Whirlpool",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Surface vitrée, four autonettoyant spacieux, boutons de commande simples.", en: "Glass cooktop, roomy self-cleaning oven, simple control knobs." },
    description: {
      fr: "Cuisinière électrique Whirlpool en acier inoxydable avec surface de cuisson vitrée, four autonettoyant spacieux et boutons de commande faciles à utiliser. Appareil d'occasion inspecté avant la vente.",
      en: "Whirlpool stainless steel electric range with a glass cooktop, a spacious self-cleaning oven and easy-to-use control knobs. Pre-owned unit inspected before sale.",
    },
    specifications: [
      { label: { fr: "Four", en: "Oven" }, value: { fr: "Autonettoyant", en: "Self-cleaning" } },
      { label: { fr: "Commandes", en: "Controls" }, value: { fr: "Boutons rotatifs", en: "Knobs" } },
    ],
    featured: true,
  },
  prod_01M19TREDHHDAM4Z744EWWDNWF: {
    title: { fr: "Cuisinière électrique Maytag Gemini à double four", en: "Maytag Gemini Double-Oven Electric Range" },
    category: "cuisinieres", subcategory: "double-four", brand: "Maytag", model: "Gemini",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Deux fours indépendants, surface vitrocéramique, fini acier inoxydable.", en: "Two independent ovens, ceramic glass cooktop, stainless finish." },
    description: {
      fr: "Cuisinière électrique Maytag Gemini à double four en acier inoxydable. Les deux fours permettent de préparer plusieurs plats simultanément à des températures différentes, et la surface de cuisson en vitrocéramique facilite le nettoyage.",
      en: "Maytag Gemini double-oven electric range in stainless steel. The two ovens let you cook several dishes at different temperatures at once, and the ceramic glass cooktop makes cleanup easy.",
    },
    specifications: [
      { label: { fr: "Configuration", en: "Configuration" }, value: { fr: "Double four", en: "Double oven" } },
      { label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Vitrocéramique", en: "Ceramic glass" } },
    ],
    imageCrops: { "84d7ecaa-4c32-499b-b4c7-fd765e657804.png": [60, 340, 720, 1170] },
    locationId: "vimont", featured: true,
  },
  prod_01M19SVZB7PRMQDC6KCAM66G1R: {
    title: { fr: "Cuisinière électrique Whirlpool à surface vitrocéramique", en: "Whirlpool Electric Range with Ceramic Glass Cooktop" },
    category: "cuisinieres", subcategory: "electrique", brand: "Whirlpool",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Modèle en acier inoxydable avec surface vitrocéramique et four spacieux.", en: "Stainless steel model with ceramic glass cooktop and spacious oven." },
    description: {
      fr: "Cuisinière électrique Whirlpool en acier inoxydable avec surface de cuisson en vitrocéramique et four spacieux. Une excellente option pour votre cuisine à prix abordable.",
      en: "Whirlpool stainless steel electric range with a ceramic glass cooktop and a spacious oven. A great, affordable option for your kitchen.",
    },
    specifications: [{ label: { fr: "Surface de cuisson", en: "Cooktop" }, value: { fr: "Vitrocéramique", en: "Ceramic glass" } }],
  },
  prod_01M17NT3ACZHY61A748M3C7XBB: {
    title: { fr: "Ensemble Samsung blanc 4 appareils", en: "Samsung White 4-Piece Appliance Set" },
    category: "ensembles", subcategory: "4-appareils", brand: "Samsung",
    finish: "white", color: { fr: "Blanc", en: "White" },
    shortDescription: { fr: "Réfrigérateur, cuisinière, laveuse et sécheuse Samsung en blanc.", en: "Samsung refrigerator, range, washer and dryer in white." },
    description: {
      fr: "Donnez un style épuré à votre cuisine et à votre salle de lavage avec cet ensemble Samsung blanc : réfrigérateur, cuisinière, laveuse et sécheuse. Prix des appareils vendus séparément : réfrigérateur 750 $ (largeur 32 po, hauteur 70 po, profondeur 27 po), cuisinière 450 $, laveuse et sécheuse 800 $.",
      en: "Give your kitchen and laundry room a clean look with this Samsung white set: refrigerator, range, washer and dryer. Prices when sold separately: refrigerator $750 (32 in. W × 70 in. H × 27 in. D), range $450, washer and dryer $800.",
    },
    includes: [
      { fr: "Réfrigérateur Samsung blanc (750 $ séparément)", en: "Samsung white refrigerator ($750 separately)" },
      { fr: "Cuisinière Samsung blanche (450 $ séparément)", en: "Samsung white range ($450 separately)" },
      { fr: "Laveuse et sécheuse Samsung blanches (800 $ séparément)", en: "Samsung white washer and dryer ($800 separately)" },
    ],
    images: [],
    reviewFlags: ["Aucune photo réelle (seule une affiche promotionnelle existait). Photos des appareils à ajouter."],
  },
  prod_01M17GM1F5PEHX63C1XBVZ2DBM: {
    title: { fr: "Ensemble Samsung 4 appareils avec réfrigérateur à portes françaises", en: "Samsung 4-Piece Set with French-Door Refrigerator" },
    category: "ensembles", subcategory: "4-appareils", brand: "Samsung",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Réfrigérateur à portes françaises, laveuse, sécheuse et cuisinière Samsung.", en: "Samsung French-door refrigerator, washer, dryer and range." },
    description: {
      fr: "Ensemble complet Samsung : réfrigérateur à portes françaises (900 $ séparément), laveuse et sécheuse (850 $ séparément) et cuisinière (500 $ séparément). Appareils testés et vérifiés avant la vente.",
      en: "Complete Samsung set: French-door refrigerator ($900 separately), washer and dryer ($850 separately) and range ($500 separately). Appliances tested and checked before sale.",
    },
    includes: [
      { fr: "Réfrigérateur Samsung à portes françaises (900 $ séparément)", en: "Samsung French-door refrigerator ($900 separately)" },
      { fr: "Laveuse et sécheuse Samsung (850 $ séparément)", en: "Samsung washer and dryer ($850 separately)" },
      { fr: "Cuisinière Samsung (500 $ séparément)", en: "Samsung range ($500 separately)" },
    ],
    images: [], locationId: "vimont", sale: true,
    reviewFlags: ["Aucune photo réelle (affiche promotionnelle seulement). Photos à ajouter."],
  },
  prod_01M17ER2FVR4DEQVYYSBKZABC5: {
    title: { fr: "Ensemble 4 appareils : réfrigérateur, cuisinière, laveuse et sécheuse", en: "4-Piece Set: Refrigerator, Range, Washer and Dryer" },
    category: "ensembles", subcategory: "4-appareils", brand: null,
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Un ensemble complet testé et vérifié avant la vente.", en: "A complete set tested and checked before sale." },
    description: {
      fr: "Ensemble complet pour la cuisine et la salle de lavage : réfrigérateur (800 $ séparément; largeur 32 po, hauteur 70 po, profondeur 27 po), cuisinière (500 $ séparément), laveuse et sécheuse (800 $ séparément). Tous nos appareils sont testés et vérifiés avant la vente.",
      en: "Complete set for the kitchen and laundry room: refrigerator ($800 separately; 32 in. W × 70 in. H × 27 in. D), range ($500 separately), washer and dryer ($800 separately). All our appliances are tested and checked before sale.",
    },
    includes: [
      { fr: "Réfrigérateur (800 $ séparément)", en: "Refrigerator ($800 separately)" },
      { fr: "Cuisinière (500 $ séparément)", en: "Range ($500 separately)" },
      { fr: "Laveuse et sécheuse (800 $ séparément)", en: "Washer and dryer ($800 separately)" },
    ],
    imageCrops: { "23c62994-25fc-453a-995c-99ec2966ae35.png": [0, 500, 880, 950] },
    locationId: "vimont", sale: true,
    reviewFlags: ["Titre d'origine était un slogan. Marques des appareils à confirmer."],
  },
  prod_01M0NJFD5FC7Z5660SHZW6CZHV: {
    title: { fr: "Laveuse et sécheuse Samsung compactes", en: "Samsung Compact Washer and Dryer" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: "Samsung",
    shortDescription: { fr: "Format compact idéal pour les appartements et les condos.", en: "Compact size, ideal for apartments and condos." },
    description: {
      fr: "Laveuse et sécheuse Samsung au format compact, parfaites pour les appartements, les condos et les petits espaces. Conception peu encombrante, efficacité énergétique et performance fiable.",
      en: "Samsung compact washer and dryer, perfect for apartments, condos and smaller spaces. Space-saving design, energy efficient and reliable performance.",
    },
    specifications: [{ label: { fr: "Format", en: "Size" }, value: { fr: "Compact", en: "Compact" } }],
    locationId: "vimont", sale: true,
  },
  prod_01M0NHB2C7JA9QK7AKE69NB7MW: {
    title: { fr: "Mini laveuse et sécheuse GE", en: "GE Mini Washer and Dryer" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: "GE",
    finish: "white", color: { fr: "Blanc", en: "White" },
    shortDescription: { fr: "Format compact idéal pour les appartements et les condos.", en: "Compact size, ideal for apartments and condos." },
    description: {
      fr: "Mini laveuse et sécheuse GE, idéales pour les appartements, les condos et les petits espaces. Conception compacte et peu encombrante, efficacité énergétique et performance fiable.",
      en: "GE mini washer and dryer, ideal for apartments, condos and smaller spaces. Compact, space-saving design, energy efficient and reliable performance.",
    },
    specifications: [{ label: { fr: "Format", en: "Size" }, value: { fr: "Compact", en: "Compact" } }],
    images: [], locationId: "vimont", sale: true,
    reviewFlags: ["Aucune photo réelle (affiche promotionnelle seulement). Photos à ajouter."],
  },
  prod_01M0NG3GR3YEY76PNWHHXW6GZS: {
    title: { fr: "Mini laveuse et sécheuse Blomberg", en: "Blomberg Mini Washer and Dryer" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: "Blomberg",
    finish: "white", color: { fr: "Blanc", en: "White" },
    shortDescription: { fr: "Format compact idéal pour les appartements et les condos.", en: "Compact size, ideal for apartments and condos." },
    description: {
      fr: "Mini laveuse et sécheuse Blomberg, parfaites pour les appartements, les condos et les petits espaces. Conception compacte, efficacité énergétique et performance fiable.",
      en: "Blomberg mini washer and dryer, perfect for apartments, condos and smaller spaces. Compact design, energy efficient and reliable performance.",
    },
    specifications: [{ label: { fr: "Format", en: "Size" }, value: { fr: "Compact", en: "Compact" } }],
    sale: true,
  },
  prod_01M0NENF710HPYAKEQ33NEHQBJ: {
    title: { fr: "Laveuse et sécheuse Samsung grises", en: "Samsung Grey Washer and Dryer" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: "Samsung",
    finish: "grey", color: { fr: "Gris", en: "Grey" },
    quantity: 5, inventoryPolicy: "multiple",
    shortDescription: { fr: "Ensemble Samsung gris, 5 ensembles en stock.", en: "Samsung grey set, 5 sets in stock." },
    description: {
      fr: "Laveuse et sécheuse Samsung en gris, performance fiable et excellente qualité. Cinq ensembles disponibles en stock à notre succursale de la rue Michelin.",
      en: "Samsung washer and dryer in grey, reliable performance and great quality. Five sets available in stock at our Michelin Street location.",
    },
    locationId: "vimont", featured: true, badges: ["available-today"],
  },
  prod_01M0ND6XK1X12J6BJ3XQJ0Z0HA: {
    title: { fr: "Laveuse et sécheuse LG blanches", en: "LG White Washer and Dryer" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: "LG",
    finish: "white", color: { fr: "Blanc", en: "White" },
    shortDescription: { fr: "Ensemble performant et économe en énergie, grande capacité.", en: "Efficient, energy-saving set with large capacity." },
    description: {
      fr: "Ensemble laveuse et sécheuse LG en blanc, performant et économe en énergie. Grande capacité et fonctionnement fiable pour tous vos besoins de lessive.",
      en: "LG washer and dryer set in white, efficient and energy-saving. Large capacity and reliable operation for all your laundry needs.",
    },
    featured: true,
  },
  prod_01M0K57CRHSZ8V16V95RE2Y5QZ: {
    title: { fr: "Ensemble Samsung : réfrigérateur, cuisinière, laveuse et sécheuse", en: "Samsung Set: Refrigerator, Range, Washer and Dryer" },
    category: "ensembles", subcategory: "4-appareils", brand: "Samsung",
    finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    shortDescription: { fr: "Ensemble Samsung complet à prix réduit.", en: "Complete Samsung set at a reduced price." },
    description: {
      fr: "Ensemble d'électroménagers Samsung : réfrigérateur (1 200 $ séparément), cuisinière (650 $ séparément), laveuse et sécheuse (880 $ séparément).",
      en: "Samsung appliance set: refrigerator ($1,200 separately), range ($650 separately), washer and dryer ($880 separately).",
    },
    includes: [
      { fr: "Réfrigérateur Samsung (1 200 $ séparément)", en: "Samsung refrigerator ($1,200 separately)" },
      { fr: "Cuisinière Samsung (650 $ séparément)", en: "Samsung range ($650 separately)" },
      { fr: "Laveuse et sécheuse Samsung (880 $ séparément)", en: "Samsung washer and dryer ($880 separately)" },
    ],
    sale: true,
  },
  prod_01M0K3HZQHMQSM9X8Q6CZQWBX7: {
    title: { fr: "Réfrigérateur Samsung Twin Cooling en acier inoxydable, 32 po", en: "Samsung Twin Cooling Stainless Steel Refrigerator, 32 in." },
    category: "refrigerateurs", subcategory: "congelateur-bas", brand: "Samsung",
    width: 32, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 32, heightIn: 70, depthIn: 37 },
    shortDescription: { fr: "Technologie Twin Cooling, boîtier en acier inoxydable.", en: "Twin Cooling technology, stainless steel body." },
    description: {
      fr: "Réfrigérateur Samsung en acier inoxydable doté de la technologie Twin Cooling, qui aide à garder les aliments frais et à réduire le mélange des odeurs. Dimensions : largeur 32 po, hauteur 70 po, profondeur 37 po.",
      en: "Samsung stainless steel refrigerator with Twin Cooling technology, which helps keep food fresh and reduces odour mixing. Dimensions: 32 in. W × 70 in. H × 37 in. D.",
    },
    specifications: [{ label: { fr: "Technologie", en: "Technology" }, value: { fr: "Twin Cooling", en: "Twin Cooling" } }],
    sale: true,
  },
  prod_01M0K2VQJE6D66Z0VB8R62QHTE: {
    title: { fr: "Réfrigérateur à portes françaises Samsung Twin Cooling, 32 po", en: "Samsung Twin Cooling French-Door Refrigerator, 32 in." },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Samsung",
    width: 32, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 32, heightIn: 70, depthIn: 37 },
    shortDescription: { fr: "Portes françaises, technologie Twin Cooling, acier inoxydable.", en: "French doors, Twin Cooling technology, stainless steel." },
    description: {
      fr: "Réfrigérateur Samsung à portes françaises en acier inoxydable, avec technologie Twin Cooling pour garder les aliments frais et réduire le mélange des odeurs. Appareil remis à neuf. Dimensions : largeur 32 po, hauteur 70 po, profondeur 37 po.",
      en: "Samsung French-door refrigerator in stainless steel, with Twin Cooling technology to keep food fresh and reduce odour mixing. Refurbished unit. Dimensions: 32 in. W × 70 in. H × 37 in. D.",
    },
    specifications: [{ label: { fr: "Technologie", en: "Technology" }, value: { fr: "Twin Cooling", en: "Twin Cooling" } }],
    sale: true, featured: true,
  },
  prod_01M0K1GBRE64XMXJDM3MBT77D2: {
    title: { fr: "Réfrigérateur à portes françaises Samsung Twin Cooling, 37 po", en: "Samsung Twin Cooling French-Door Refrigerator, 37 in." },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Samsung",
    width: 37, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 37, heightIn: 70, depthIn: 34 },
    shortDescription: { fr: "Trois portes, congélateur spacieux en bas, fini résistant aux traces de doigts.", en: "Three doors, spacious bottom freezer, fingerprint-resistant finish." },
    description: {
      fr: "Réfrigérateur Samsung à trois portes en acier inoxydable, avec congélateur spacieux en bas et portes françaises pour un accès facile aux aliments frais. Finition résistante aux traces de doigts et technologie Twin Cooling. Dimensions : largeur 37 po, hauteur 70 po, profondeur 34 po.",
      en: "Samsung three-door stainless steel refrigerator with a spacious bottom freezer and French doors for easy access to fresh food. Fingerprint-resistant finish and Twin Cooling technology. Dimensions: 37 in. W × 70 in. H × 34 in. D.",
    },
    specifications: [{ label: { fr: "Technologie", en: "Technology" }, value: { fr: "Twin Cooling", en: "Twin Cooling" } }],
    featured: true,
  },
  prod_01M0JZYCHCD9DVBHDEY2H7GPQM: {
    title: { fr: "Réfrigérateur à portes françaises Samsung blanc, 33 po", en: "Samsung White French-Door Refrigerator, 33 in." },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Samsung",
    width: 33, finish: "white", color: { fr: "Blanc", en: "White" },
    dimensions: { widthIn: 33, heightIn: 67, depthIn: 33 },
    shortDescription: { fr: "Étagères modulables, tiroir congélateur en bas, fini blanc.", en: "Adjustable shelves, bottom freezer drawer, white finish." },
    description: {
      fr: "Réfrigérateur Samsung blanc à portes françaises offrant une grande capacité grâce à ses étagères modulables et à son tiroir congélateur en bas. Appareil remis à neuf. Dimensions : largeur 33 po, hauteur 67 po, profondeur 33 po.",
      en: "Samsung white French-door refrigerator with generous capacity thanks to adjustable shelves and a bottom freezer drawer. Refurbished unit. Dimensions: 33 in. W × 67 in. H × 33 in. D.",
    },
    reviewFlags: ["L'annonce d'origine mentionnait « Garantie 10 ans sur le compresseur » (garantie du fabricant) : non affiché tant que non confirmé."],
  },
  prod_01M0JZ30DMHN2STKR6Q7Y8EP2C: {
    title: { fr: "Réfrigérateur GE Profile à congélateur inférieur, 33 po", en: "GE Profile Bottom-Freezer Refrigerator, 33 in." },
    category: "refrigerateurs", subcategory: "congelateur-bas", brand: "GE Profile",
    width: 33, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 33, heightIn: 69, depthIn: 31 },
    shortDescription: { fr: "Congélateur en bas, grand espace de rangement, fini acier inoxydable.", en: "Bottom freezer, roomy interior, stainless steel finish." },
    description: {
      fr: "Réfrigérateur GE Profile en acier inoxydable avec congélateur en bas. Grand espace de rangement pour les aliments frais et surgelés, finition moderne. Appareil remis à neuf. Dimensions : largeur 33 po, hauteur 69 po, profondeur 31 po.",
      en: "GE Profile stainless steel refrigerator with a bottom freezer. Roomy storage for fresh and frozen food, modern finish. Refurbished unit. Dimensions: 33 in. W × 69 in. H × 31 in. D.",
    },
  },
  prod_01M0JYF459F19XD8XSTVWZVA97: {
    title: { fr: "Congélateur vertical en acier inoxydable, 38 po", en: "Stainless Steel Upright Freezer, 38 in." },
    category: "autres", subcategory: "congelateur", brand: null,
    width: 38, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 38, heightIn: 70, depthIn: 29 },
    shortDescription: { fr: "Grande capacité, porte pleine, idéal pour les familles et la restauration.", en: "Large capacity, solid door, ideal for families and food service." },
    description: {
      fr: "Congélateur vertical en acier inoxydable, idéal pour stocker de grandes quantités d'aliments surgelés. Porte pleine et accès facile aux produits; convient aux familles comme aux espaces de restauration. Appareil remis à neuf. Dimensions : largeur 38 po, hauteur 70 po, profondeur 29 po.",
      en: "Stainless steel upright freezer, ideal for storing large quantities of frozen food. Solid door and easy access; suits families as well as food-service spaces. Refurbished unit. Dimensions: 38 in. W × 70 in. H × 29 in. D.",
    },
    reviewFlags: ["Marque non précisée (la description d'origine mentionnait « Ellipse », probablement copié d'une autre annonce)."],
  },
  prod_01M0JWAWGDY4JF5A243X0WYGTX: {
    title: { fr: "Réfrigérateur GE avec filtration d'eau, 33 po", en: "GE Refrigerator with Water Filtration, 33 in." },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "GE",
    width: 33, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 33, heightIn: 68, depthIn: 32 },
    shortDescription: { fr: "Eau fraîche et filtrée directement au réfrigérateur, boîtier en acier inoxydable.", en: "Fresh filtered water right at the fridge, stainless steel body." },
    description: {
      fr: "Réfrigérateur GE en acier inoxydable avec système de filtration d'eau. Appareil remis à neuf. Dimensions : largeur 33 po, hauteur 68 po, profondeur 32 po.",
      en: "GE stainless steel refrigerator with a water filtration system. Refurbished unit. Dimensions: 33 in. W × 68 in. H × 32 in. D.",
    },
    specifications: [{ label: { fr: "Filtration", en: "Filtration" }, value: { fr: "Filtre à eau intégré", en: "Built-in water filter" } }],
  },
  prod_01M0JVMBN6EF1X1JWXS8W0ZEZM: {
    title: { fr: "Réfrigérateur Maytag de 36 po", en: "Maytag 36-in. Refrigerator" },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Maytag",
    width: 36, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 36, heightIn: 70, depthIn: 29 },
    shortDescription: { fr: "Tablettes en verre ajustables, plusieurs tiroirs spacieux, filtre Fresh Flow.", en: "Adjustable glass shelves, several roomy drawers, Fresh Flow filter." },
    description: {
      fr: "Réfrigérateur Maytag spacieux et bien organisé : tablettes en verre ajustables, plusieurs tiroirs pour les fruits et légumes et grande capacité de rangement pour les familles. Filtre Fresh Flow. Appareil remis à neuf. Dimensions : largeur 36 po, hauteur 70 po, profondeur 29 po.",
      en: "Spacious, well-organized Maytag refrigerator: adjustable glass shelves, several fruit and vegetable drawers and generous storage for families. Fresh Flow filter. Refurbished unit. Dimensions: 36 in. W × 70 in. H × 29 in. D.",
    },
    specifications: [
      { label: { fr: "Tablettes", en: "Shelves" }, value: { fr: "Verre, ajustables", en: "Glass, adjustable" } },
      { label: { fr: "Filtre", en: "Filter" }, value: { fr: "Fresh Flow", en: "Fresh Flow" } },
    ],
    reviewFlags: ["Prix affiché 850 $, mais la description d'origine indiquait 800 $ : à confirmer."],
  },
  prod_01M0JV9NAXW9626EFC585AHPV1: {
    title: { fr: "Réfrigérateur à portes françaises Samsung en acier inoxydable, 32 po", en: "Samsung Stainless Steel French-Door Refrigerator, 32 in." },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: "Samsung",
    width: 32, finish: "stainless", color: { fr: "Acier inoxydable", en: "Stainless steel" },
    dimensions: { widthIn: 32, heightIn: 70, depthIn: 27 },
    shortDescription: { fr: "Twin Cooling, tablettes ajustables, grands balconnets, deux bacs à légumes.", en: "Twin Cooling, adjustable shelves, large door bins, two crisper drawers." },
    description: {
      fr: "Réfrigérateur Samsung à portes françaises en acier inoxydable : technologie Twin Cooling, tablettes ajustables, grands balconnets de porte et deux bacs à légumes spacieux. Appareil remis à neuf. Dimensions : largeur 32 po, hauteur 70 po, profondeur 27 po.",
      en: "Samsung stainless steel French-door refrigerator: Twin Cooling technology, adjustable shelves, large door bins and two spacious crisper drawers. Refurbished unit. Dimensions: 32 in. W × 70 in. H × 27 in. D.",
    },
    specifications: [{ label: { fr: "Technologie", en: "Technology" }, value: { fr: "Twin Cooling", en: "Twin Cooling" } }],
  },
  prod_01M00WQAMEHKY7HXRBS6FCD6TG: {
    title: { fr: "Sélection d'appareils (annonce générique)", en: "Appliance selection (generic listing)" },
    category: "autres", subcategory: null, brand: null,
    status: "draft", images: [],
    reviewFlags: ["Annonce générique « Premium Appliances Set » sans appareil identifiable ni photo réelle : non publiée, à revoir ou archiver."],
  },
  prod_01M00VQ3FCX59XR8EN035R9KHH: {
    title: { fr: "Carte-cadeau numérique Écono Électro", en: "Écono Électro Digital Gift Card" },
    category: "autres", subcategory: "carte-cadeau", brand: null,
    condition: "new", inventoryPolicy: "continue", quantity: 999,
    deliveryEligible: false, pickupEligible: false,
    images: [],
    variants: [
      { id: "10", label: { fr: "10 $", en: "$10" }, price: 10 },
      { id: "20", label: { fr: "20 $", en: "$20" }, price: 20 },
      { id: "50", label: { fr: "50 $", en: "$50" }, price: 50 },
      { id: "100", label: { fr: "100 $", en: "$100" }, price: 100 },
    ],
    shortDescription: { fr: "Échangeable en magasin sur les réfrigérateurs, laveuses, sécheuses et cuisinières.", en: "Redeemable in store for refrigerators, washers, dryers and ranges." },
    description: {
      fr: "Offrez le cadeau parfait avec la carte-cadeau numérique Écono Électro, échangeable exclusivement en magasin sur nos réfrigérateurs, laveuses, sécheuses et cuisinières. Idéale pour les nouveaux propriétaires ou pour quiconque renouvelle ses électroménagers.",
      en: "Give the perfect gift with the Écono Électro digital gift card, redeemable exclusively in store for our refrigerators, washers, dryers and ranges. Ideal for new homeowners or anyone upgrading their appliances.",
    },
    reviewFlags: ["Carte-cadeau : à recréer avec la fonction Cartes-cadeaux de Shopify plutôt qu'en produit standard."],
  },
  prod_01M00N0JNS9X0466GC3V8MZS0H: {
    title: { fr: "Laveuse et sécheuse (annonce incomplète)", en: "Washer and dryer (incomplete listing)" },
    category: "laveuses-secheuses", subcategory: "ensemble-laveuse-secheuse", brand: null,
    status: "draft",
    reviewFlags: ["Prix de 49 $ invraisemblable et aucune description : non publiée tant que le prix et l'appareil ne sont pas confirmés."],
  },
  prod_01KTHQX11PE46RAJ35806QX2S2: {
    title: { fr: "Réfrigérateur à portes françaises en acier inoxydable (annonce à corriger)", en: "Stainless steel French-door refrigerator (listing needs correction)" },
    category: "refrigerateurs", subcategory: "portes-francaises", brand: null,
    status: "draft",
    reviewFlags: ["Produit de démonstration du gabarit Hostinger (slug « shirt-jacket », description de veste). Prix 150 $ / comparé 2 100 $ non fiables : non publié."],
  },
};
