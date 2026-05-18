from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    locale: Optional[str] = "fr"


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: Optional[str] = None
    message: str
    locale: str = "fr"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "Plume Suites API"}


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(payload: ContactMessageCreate):
    obj = ContactMessage(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return obj


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contact_messages():
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
    return items


# Journal — static editorial content served by API for future flexibility
JOURNAL_ARTICLES = [
    {
        "slug": "canal-de-bourgogne-velo-fleurey",
        "category": {"fr": "Vélo & nature", "en": "Cycling & nature"},
        "title": {
            "fr": "Le canal de Bourgogne à vélo, depuis Fleurey-sur-Ouche",
            "en": "Cycling the Burgundy canal from Fleurey-sur-Ouche",
        },
        "excerpt": {
            "fr": "Itinéraires lents, étapes gourmandes et villages de pierre — notre guide pour parcourir le canal de Bourgogne à vélo depuis Plume Suites.",
            "en": "Slow itineraries, gourmet stops and stone villages — our guide to cycling the Burgundy canal from Plume Suites.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/pjvibq7i_alvin-frey-uxOR5cIlaCY-unsplash.jpg",
        "date": "2026-02-12",
        "read_time": {"fr": "8 min", "en": "8 min"},
        "body": {
            "fr": [
                "Depuis Plume Suites, le canal de Bourgogne est à une minute à pied. C'est là que commence l'un des plus beaux itinéraires cyclables de France, plat, ombragé, jalonné de villages de pierre et de tables gourmandes.",
                "Au départ de Fleurey-sur-Ouche, vous longez l'eau vers l'ouest pour atteindre Pont-de-Pany puis Pont-d'Ouche, à 28 km. La voie est entièrement asphaltée, accessible aux familles, aux gravels et même aux vélos électriques.",
                "En remontant vers l'est, la halte de Plombières-lès-Dijon offre une parenthèse calme avant d'entrer dans Dijon par les berges — un trajet de 14 km au cœur de la nature.",
                "Plume Suites fait partie des hébergements accueillant les cyclistes : local fermé pour les vélos, prises pour recharger les batteries, plateau petit-déjeuner livré dans la suite, conseils d'itinéraires personnalisés.",
                "Les amateurs de longue distance prolongeront vers la Loire (EuroVelo 6) ou vers Beaune via les coteaux. Pour les autres, une boucle d'une journée suffit à comprendre pourquoi la Bourgogne se découvre, idéalement, à vélo.",
            ],
            "en": [
                "From Plume Suites, the Burgundy canal is a one-minute walk away. This is where one of France's most beautiful cycle routes begins — flat, shaded, dotted with stone villages and gourmet tables.",
                "Heading west from Fleurey-sur-Ouche, you follow the water to Pont-de-Pany and Pont-d'Ouche, 28 km away. The route is fully paved, family-friendly, and welcoming to gravel and electric bikes.",
                "Heading east, the quiet stop at Plombières-lès-Dijon offers a pause before entering Dijon along the banks — a 14 km ride at the heart of nature.",
                "Plume Suites is among the cycling-friendly addresses: locked bike storage, charging outlets for e-bike batteries, breakfast delivered to your suite, and personalised route recommendations.",
                "Long-distance riders can continue to the Loire (EuroVelo 6) or head toward Beaune via the hillsides. For others, a single day loop is enough to understand why Burgundy is best discovered, ideally, by bike.",
            ],
        },
    },
    {
        "slug": "eurovelo-6-bourgogne",
        "category": {"fr": "Vélo & itinéraires", "en": "Cycling routes"},
        "title": {
            "fr": "EuroVelo 6 : la Bourgogne au cœur de la grande traversée",
            "en": "EuroVelo 6: Burgundy at the heart of the long ride",
        },
        "excerpt": {
            "fr": "De Nantes à Budapest, l'EuroVelo 6 traverse la Bourgogne. Étapes, hébergements et bonnes adresses entre canal et vignobles.",
            "en": "From Nantes to Budapest, EuroVelo 6 crosses Burgundy. Stages, stays and good addresses between canal and vineyards.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",
        "date": "2026-02-05",
        "read_time": {"fr": "7 min", "en": "7 min"},
        "body": {
            "fr": [
                "L'EuroVelo 6 relie l'Atlantique à la mer Noire en suivant trois fleuves : Loire, Saône, Danube. La traversée de la Bourgogne, par le canal du Centre puis le canal de Bourgogne, en constitue l'un des plus beaux tronçons.",
                "À hauteur de Fleurey-sur-Ouche, l'EuroVelo 6 longe le canal de Bourgogne. C'est ici que beaucoup de cyclo-voyageurs choisissent de s'arrêter une nuit — pour se reposer, profiter de la table gastronomique du restaurant Ô P'tit Repère du Goût et reprendre la route au lever du jour.",
                "Les étapes côté Bourgogne : Dijon, Pont-d'Ouche, Pouilly-en-Auxois, Vandenesse, Tonnerre. Chacune avec son patrimoine, ses villages, ses haltes vignerons.",
                "Plume Suites s'adresse aussi aux voyageurs qui veulent transformer une étape EuroVelo en parenthèse de slow living. Une nuit, deux jours, une semaine — la suite Douceur ou L'Envolée accueille avec calme.",
            ],
            "en": [
                "EuroVelo 6 links the Atlantic to the Black Sea, following three rivers: the Loire, Saône and Danube. Crossing Burgundy along the Canal du Centre and then the Burgundy canal is one of its most beautiful sections.",
                "Near Fleurey-sur-Ouche, EuroVelo 6 hugs the Burgundy canal. This is where many long-distance riders choose to stop for a night — to rest, to enjoy the gastronomic table at Ô P'tit Repère du Goût, and to head back on the road at dawn.",
                "The Burgundy stages: Dijon, Pont-d'Ouche, Pouilly-en-Auxois, Vandenesse, Tonnerre. Each with its heritage, villages and winegrower stops.",
                "Plume Suites also welcomes travellers wanting to turn an EuroVelo stage into a slow-living pause. One night, two days, a week — the Douceur or L'Envolée suite welcomes you quietly.",
            ],
        },
    },
    {
        "slug": "week-end-velo-canal-dijon-beaune",
        "category": {"fr": "Escapade week-end", "en": "Weekend escape"},
        "title": {
            "fr": "Un week-end à vélo entre Dijon et Beaune",
            "en": "A weekend by bike between Dijon and Beaune",
        },
        "excerpt": {
            "fr": "Trois jours, deux nuits, le canal de Bourgogne et la Côte de Nuits — notre programme pour un week-end vélo & slow living depuis Plume Suites.",
            "en": "Three days, two nights, the Burgundy canal and the Côte de Nuits — our cycling & slow-living weekend programme from Plume Suites.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/sapcz2ed_mark-bloomfield-5PhGfLjTL0w-unsplash.jpg",
        "date": "2026-01-28",
        "read_time": {"fr": "6 min", "en": "6 min"},
        "body": {
            "fr": [
                "Jour 1 — Arrivée à Plume Suites en fin d'après-midi. Petit tour à vélo le long du canal jusqu'à Plombières-lès-Dijon, puis dîner gastronomique au restaurant Ô P'tit Repère du Goût.",
                "Jour 2 — Boucle à vélo Dijon/Marsannay. 35 km plats, dégustation chez un vigneron, déjeuner à Gevrey-Chambertin, retour par les coteaux.",
                "Jour 3 — Route des grands crus jusqu'à Beaune, visite des Hospices, retour en train. Ou : louer un vélo électrique pour atteindre Beaune sans effort.",
                "Conseils pratiques : Plume Suites met à disposition un local fermé pour les vélos, des plans imprimés des plus belles boucles, et peut organiser sur demande la location de vélos & le retour en taxi.",
            ],
            "en": [
                "Day 1 — Arrive at Plume Suites in the late afternoon. Short canal ride to Plombières-lès-Dijon, then gastronomic dinner at Ô P'tit Repère du Goût.",
                "Day 2 — Dijon/Marsannay bike loop. 35 flat km, tasting at a winegrower's, lunch in Gevrey-Chambertin, return through the hillsides.",
                "Day 3 — Grands Crus route to Beaune, visit of the Hospices, return by train. Or: rent an e-bike to reach Beaune effortlessly.",
                "Practical notes: Plume Suites offers locked bike storage, printed maps of the best loops, and can arrange bike rentals and taxi pickups on request.",
            ],
        },
    },
    {
        "slug": "matins-au-bord-du-canal",
        "category": {"fr": "Carnet", "en": "Notebook"},
        "title": {
            "fr": "Matins au bord du canal",
            "en": "Mornings by the canal",
        },
        "excerpt": {
            "fr": "Une promenade lente à l'aube, entre brume bourguignonne et reflets de pierre.",
            "en": "A slow walk at dawn, between Burgundy mist and stone reflections.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/oz1hfjes_zhu-yunxiao-2E8g1HimrNc-unsplash.jpg",
        "date": "2026-02-04",
        "read_time": {"fr": "4 min", "en": "4 min"},
        "body": {
            "fr": [
                "Avant que le village ne s'éveille, le canal de Bourgogne se révèle dans une lumière feutrée. L'eau, presque immobile, reflète la pierre des maisons et les arbres encore endormis.",
                "On marche sans but. On écoute le silence. Une péniche au loin, le clapotis d'un héron.",
                "À Fleurey-sur-Ouche, les matins ont cette qualité rare : ils ne demandent rien. Ils invitent simplement à ralentir.",
            ],
            "en": [
                "Before the village wakes, the Burgundy canal reveals itself in a hushed light. The water, almost still, reflects the stone houses and the sleeping trees.",
                "You walk without purpose. You listen to the silence. A barge in the distance, the ripple of a heron.",
                "In Fleurey-sur-Ouche, mornings carry a rare quality: they ask nothing. They simply invite you to slow down.",
            ],
        },
    },
    {
        "slug": "table-de-saison",
        "category": {"fr": "Gastronomie", "en": "Gastronomy"},
        "title": {
            "fr": "Une table de saison",
            "en": "A seasonal table",
        },
        "excerpt": {
            "fr": "Au restaurant Ô P'tit Repère du Goût, la Bourgogne se raconte à travers les producteurs locaux.",
            "en": "At Ô P'tit Repère du Goût, Burgundy tells its story through local growers.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/u8mp3yfa_ambitious-studio-rick-barrett-WT_r3dUwx6I-unsplash.jpg",
        "date": "2026-01-22",
        "read_time": {"fr": "5 min", "en": "5 min"},
        "body": {
            "fr": [
                "La carte change avec les saisons. Quelques lignes, quelques producteurs, beaucoup d'attention.",
                "Le maraîcher du village, le fromager de la côte, le vigneron des Hautes-Côtes — chacun raconte un fragment du paysage.",
                "Sous nos suites, la table devient une parenthèse. On y vient pour manger, on en repart avec un souvenir.",
            ],
            "en": [
                "The menu changes with the seasons. A few lines, a few growers, much attention.",
                "The village gardener, the cheesemaker from the hills, the winemaker from Hautes-Côtes — each shares a fragment of the landscape.",
                "Below our suites, the table becomes a pause. You come to eat, you leave with a memory.",
            ],
        },
    },
    {
        "slug": "route-des-vins",
        "category": {"fr": "Escapade", "en": "Escape"},
        "title": {
            "fr": "La route des vins, lentement",
            "en": "The wine route, slowly",
        },
        "excerpt": {
            "fr": "De Marsannay à Meursault, un itinéraire pensé pour ceux qui prennent leur temps.",
            "en": "From Marsannay to Meursault, an itinerary for those who take their time.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",
        "date": "2026-01-10",
        "read_time": {"fr": "6 min", "en": "6 min"},
        "body": {
            "fr": [
                "Quitter Fleurey aux premières heures, longer les coteaux, s'arrêter sans plan précis.",
                "Marsannay pour un rouge léger. Gevrey, Vougeot, Vosne-Romanée — les noms eux-mêmes ralentissent le voyage.",
                "Puis le silence des grands crus, la pierre dorée, et le sentiment, à chaque domaine, de toucher quelque chose d'intemporel.",
            ],
            "en": [
                "Leaving Fleurey in the early hours, following the slopes, stopping without a precise plan.",
                "Marsannay for a light red. Gevrey, Vougeot, Vosne-Romanée — the names themselves slow the journey down.",
                "Then the silence of the great vineyards, the golden stone, and the feeling, at each domaine, of touching something timeless.",
            ],
        },
    },
    {
        "slug": "douceur-de-vivre",
        "category": {"fr": "Art de vivre", "en": "Lifestyle"},
        "title": {
            "fr": "Douceur de vivre",
            "en": "The art of slow living",
        },
        "excerpt": {
            "fr": "Pourquoi nous croyons aux séjours longs, aux lumières dorées et aux livres qui traînent.",
            "en": "Why we believe in long stays, golden light and books left open.",
        },
        "cover": "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/ndqs3jyd_rinat-shakirov-gwfOeeb-QjY-unsplash.jpg",
        "date": "2025-12-18",
        "read_time": {"fr": "3 min", "en": "3 min"},
        "body": {
            "fr": [
                "Plume Suites n'a pas été pensé pour les nuitées pressées. Plutôt pour les week-ends qui s'étirent, les semaines qui se posent.",
                "Un livre laissé ouvert. Un café qui refroidit doucement. La lumière qui traverse la chambre, autrement chaque heure.",
                "Le luxe, pour nous, c'est ce temps que l'on choisit de ne pas remplir.",
            ],
            "en": [
                "Plume Suites wasn't designed for hurried nights. Rather for weekends that stretch, weeks that settle.",
                "A book left open. A coffee slowly cooling. The light crossing the room, differently each hour.",
                "Luxury, for us, is the time we choose not to fill.",
            ],
        },
    },
    {
        "slug": "nouveau-chapitre-mediterraneen",
        "category": {"fr": "Collection", "en": "Collection"},
        "title": {
            "fr": "Un nouveau chapitre méditerranéen",
            "en": "A new Mediterranean chapter",
        },
        "excerpt": {
            "fr": "Bientôt, une seconde adresse au sud, entre lumière andalouse et silence des oliviers.",
            "en": "Soon, a second address in the south, between Andalusian light and the silence of olive trees.",
        },
        "cover": "https://images.unsplash.com/photo-1736428995445-827f17ad9cc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwzfHxhbmRhbHVzaWElMjBzcGFpbiUyMGNvYXN0fGVufDB8fHx8MTc3OTEyNTg0OXww&ixlib=rb-4.1.0&q=85",
        "date": "2025-11-30",
        "read_time": {"fr": "4 min", "en": "4 min"},
        "body": {
            "fr": [
                "Plume Suites Collection s'étend. Après la Bourgogne, une nouvelle adresse prend forme sur la Costa del Sol.",
                "Le projet est encore confidentiel. Une maison blanche, un patio, une lumière qui change tout.",
                "Mêmes valeurs, autre géographie : la lenteur, le détail, l'art de recevoir.",
            ],
            "en": [
                "Plume Suites Collection is growing. After Burgundy, a new address is taking shape on the Costa del Sol.",
                "The project is still confidential. A white house, a patio, a light that changes everything.",
                "Same values, different geography: slowness, detail, the art of welcoming.",
            ],
        },
    },
]


@api_router.get("/journal")
async def list_journal():
    return [
        {k: v for k, v in a.items() if k != "body"} for a in JOURNAL_ARTICLES
    ]


@api_router.get("/journal/{slug}")
async def get_journal_article(slug: str):
    for a in JOURNAL_ARTICLES:
        if a["slug"] == slug:
            return a
    raise HTTPException(status_code=404, detail="Article not found")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
