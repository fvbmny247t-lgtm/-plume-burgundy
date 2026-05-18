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
        "cover": "https://static.prod-images.emergentagent.com/jobs/9f3bfbc7-be66-4d19-b445-7eab6a98eb47/images/ad7c098fd3177e2c398eea963ce0f20cb29a1c232a3273d56900e626537962d8.png",
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
        "cover": "https://images.unsplash.com/photo-1616671285410-2a676a9a433d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwzfHxnYXN0cm9ub215JTIwZmluZSUyMGRpbmluZ3xlbnwwfHx8fDE3NzkxMjU4NDl8MA&ixlib=rb-4.1.0&q=85",
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
        "cover": "https://static.prod-images.emergentagent.com/jobs/9f3bfbc7-be66-4d19-b445-7eab6a98eb47/images/cfcfe909a4314bdbcf72c65923b299904d188bcc0cffa7d5ba37b784d5939a2a.png",
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
        "cover": "https://static.prod-images.emergentagent.com/jobs/9f3bfbc7-be66-4d19-b445-7eab6a98eb47/images/493b60b139867f69a68c79dd8513bac88f3c0231159c259962fa2946d377e6ac.png",
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
