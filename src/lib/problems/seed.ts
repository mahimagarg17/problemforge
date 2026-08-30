import type { Comment, Problem } from "./types";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Starter problems. Used to seed the local preview store, and shown on the
 * landing page when the database has nothing in it yet.
 */
export const SEED_PROBLEMS: Problem[] = ([
  {
    id: "seed-pg-listings",
    author_name: "Aarti",
    title: "I never know whether a rental listing is actually trustworthy",
    description:
      "Every listing looks fine in the photos. Then you visit and the pictures are years old, the water only runs twice a day, and the internet barely works. There is no honest way to check any of this before you pay a deposit.",
    category: "housing_roommates",
    frequency: "weekly",
    pain_level: 4,
    current_workaround:
      "Visiting as many places as I can in person and asking whoever already lives there.",
    me_too_count: 214,
    comments_count: 3,
    created_at: daysAgo(2),
  },
  {
    id: "seed-what-to-cook",
    author_name: "Deepak",
    title: "I waste 20 minutes every evening deciding what to cook",
    description:
      "I get home, open the fridge, and just stand there. There is food in there but no obvious meal. I end up scrolling recipe videos for longer than it would take to actually cook something.",
    category: "food_dining",
    frequency: "daily",
    pain_level: 3,
    current_workaround: "Making the same three things on repeat, or ordering in when I give up.",
    me_too_count: 331,
    comments_count: 2,
    created_at: daysAgo(1),
  },
  {
    id: "seed-find-plumber",
    author_name: "Meera",
    title: "Finding a reliable plumber is harder than it should be",
    description:
      "When something leaks, it is a gamble every time. The app options charge a lot and take days. The local numbers either do not pick up or quote a random price once they are already at the door.",
    category: "local_services",
    frequency: "rarely",
    pain_level: 4,
    current_workaround: "Asking the building group chat and hoping someone has a name to share.",
    me_too_count: 158,
    comments_count: 1,
    created_at: daysAgo(4),
  },
  {
    id: "seed-textbooks",
    author_name: "Sana",
    title: "Seniors throw away expensive textbooks while juniors buy them new",
    description:
      "At the end of every term, people leave stacks of costly reference books in the hallway or sell them for almost nothing. The next batch walks into the shop and pays full price for the same books a week later.",
    category: "education",
    frequency: "weekly",
    pain_level: 3,
    current_workaround: "Posting photos in a group chat where they scroll past in an hour.",
    me_too_count: 122,
    comments_count: 0,
    created_at: daysAgo(6),
  },
  {
    id: "seed-shared-bills",
    author_name: "Rohan",
    title: "Chasing housemates for shared bills without sounding annoying",
    description:
      "One person pays the electricity, someone else buys the shared groceries, another covers the internet. The apps for this exist, but reminding people to actually pay you back two weeks later feels rude every single time.",
    category: "money_finance",
    frequency: "several_times_a_week",
    pain_level: 3,
    current_workaround: "A messy shared note and the occasional awkward reminder in the group.",
    me_too_count: 97,
    comments_count: 1,
    created_at: daysAgo(3),
  },
  {
    id: "seed-parking",
    author_name: "Iqra",
    title: "No way to know if a parking lot is full before I get there",
    description:
      "Driving into a busy area on the weekend means circling for half an hour, only to reach the lot and find it full with a queue spilling onto the road. I would happily park elsewhere if I knew in advance.",
    category: "transport_travel",
    frequency: "several_times_a_week",
    pain_level: 3,
    current_workaround: "Leaving much earlier than needed, or just taking a cab and paying more.",
    me_too_count: 143,
    comments_count: 0,
    created_at: daysAgo(5),
  },
] as Omit<Problem, "is_seed">[]).map((p) => ({ ...p, is_seed: true }));

export const SEED_COMMENTS: Comment[] = [
  {
    id: "seed-c1",
    problem_id: "seed-pg-listings",
    author_name: "Nikhil",
    content:
      "Same here. I started asking to see a short video call walkthrough before visiting. Cuts out about half the wasted trips.",
    created_at: daysAgo(1),
  },
  {
    id: "seed-c2",
    problem_id: "seed-pg-listings",
    author_name: "Priya",
    content: "The water timing thing is never in any listing. I always forget to ask until I have moved in.",
    created_at: daysAgo(1),
  },
  {
    id: "seed-c3",
    problem_id: "seed-pg-listings",
    author_name: "Tom",
    content: "I take a speed test screenshot when I visit now and ask them to run it on their own phone too.",
    created_at: daysAgo(0),
  },
  {
    id: "seed-c4",
    problem_id: "seed-what-to-cook",
    author_name: "Farah",
    content:
      "What helped me was writing five meals on a sticky note on the fridge. Decision fatigue mostly gone.",
    created_at: daysAgo(0),
  },
  {
    id: "seed-c5",
    problem_id: "seed-what-to-cook",
    author_name: "Sam",
    content: "I prep two base sauces on Sunday. Most nights are then just pasta or rice plus whatever is in the drawer.",
    created_at: daysAgo(0),
  },
  {
    id: "seed-c6",
    problem_id: "seed-find-plumber",
    author_name: "Lena",
    content: "Once I find a good one I now save them with a note about what they fixed and what they charged.",
    created_at: daysAgo(2),
  },
  {
    id: "seed-c7",
    problem_id: "seed-shared-bills",
    author_name: "Yuki",
    content: "We rotate who pays everything each month. Simpler than splitting every single thing.",
    created_at: daysAgo(1),
  },
];
