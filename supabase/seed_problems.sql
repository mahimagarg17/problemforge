-- ==============================================================================
-- ProblemForge starter problems
--
-- Run this ONCE in the Supabase SQL editor of your hosted project, after the
-- schema + 0001_mvp_anonymous.sql migration are applied.
--
-- Prereq: there must be at least one row in public.profiles.
--   Easiest way: open the deployed site and post ONE problem using the name
--   "ProblemForge". That creates an anonymous auth user + a profile via the
--   signup trigger. This file then attaches the rest to that same author.
--
-- Notes:
--   * me_too_count and comments_count are left at their default of 0.
--     Do NOT pre-fill them. Real small numbers beat fake big ones.
--   * Re-running this file will insert duplicates. Run it once.
-- ==============================================================================

with author as (
  select id
  from public.profiles
  order by (coalesce(display_name, '') = 'ProblemForge') desc, created_at asc
  limit 1
)
insert into public.problems
  (author_id, title, description, category, frequency, pain_level, current_workaround)
select
  author.id,
  v.title,
  v.description,
  v.category::problem_category,
  v.frequency::problem_frequency,
  v.pain_level,
  v.current_workaround
from author, (values
  (
    'I waste twenty minutes every evening deciding what to cook',
    'There is food in the fridge but no obvious meal, so I stand there, then scroll recipe videos for longer than it would take to just cook something. By the time I decide I am annoyed and hungry.',
    'food_dining', 'daily', 3,
    'Rotating the same three meals, or ordering in when I give up.'
  ),
  (
    'I never know whether a rental listing is actually trustworthy',
    'The photos always look fine. Then you visit and they are years old, the water runs twice a day, and the internet barely works. There is no honest way to check any of this before you pay a deposit.',
    'housing_roommates', 'weekly', 4,
    'Visiting as many places as I can in person and asking whoever already lives there.'
  ),
  (
    'Chasing housemates for their share of the bills without sounding annoying',
    'One person pays electricity, someone buys the shared groceries, someone covers internet. The splitting apps exist, but reminding people to actually pay you back two weeks later feels rude every single time.',
    'money_finance', 'several_times_a_week', 3,
    'A messy shared note and the occasional awkward nudge in the group chat.'
  ),
  (
    'Finding a plumber or electrician who shows up on time and quotes an honest price',
    'When something leaks or sparks it is a gamble every time. The app options charge a lot and take days. The local numbers either do not pick up or quote a random price once they are already at the door.',
    'local_services', 'rarely', 4,
    'Asking the building group chat and hoping someone has a name to share.'
  ),
  (
    'No way to know if a parking lot is full before I have already driven there',
    'Driving into a busy area on the weekend means circling for half an hour, then reaching the lot and finding it full with a queue onto the road. I would happily park somewhere else if I knew in advance.',
    'transport_travel', 'several_times_a_week', 3,
    'Leaving much earlier than needed, or taking a cab and paying more.'
  ),
  (
    'Seniors throw away expensive textbooks while juniors buy them new',
    'At the end of every term people leave stacks of costly reference books in the hallway or sell them for almost nothing. A week later the next batch walks into the shop and pays full price for the same books.',
    'education', 'weekly', 2,
    'Posting photos in a group chat where they scroll past within an hour.'
  ),
  (
    'Recurring status meetings I cannot skip without looking checked out',
    'Half of these could be a two line message. But leaving early or declining the invite reads as not caring, so everyone sits through it and does their real work afterwards.',
    'work_productivity', 'daily', 3,
    'Half listening while clearing my inbox, and hoping my name does not come up.'
  ),
  (
    'A doctor''s handwriting is unreadable when I try to reorder the medicine later',
    'You leave the clinic with a paper slip. Days later you open a pharmacy app and cannot tell if it says 250mg or 500mg, or how the brand is spelled. The order gets rejected hours later.',
    'health_fitness', 'monthly', 4,
    'Walking to an offline pharmacy and asking the chemist to decode it.'
  ),
  (
    'Return pickups get rescheduled two or three times and I have to wait home for a courier who never comes',
    'The item does not fit, I book a return, and then the pickup slips day after day. Each time I block out the afternoon and nobody shows. Eventually I miss the return window entirely.',
    'shopping_commerce', 'monthly', 3,
    'Only buying from shops with a physical store nearby so I can return in person.'
  ),
  (
    'Group trips fall apart because nobody wants to be the one who books',
    'Everyone is keen in the chat. Then someone has to pick dates, put money down, and chase the others. That person ends up carrying all the risk, so most of the time nothing gets booked at all.',
    'other', 'weekly', 2,
    'Being the one who books, and quietly resenting it a little.'
  )
) as v(title, description, category, frequency, pain_level, current_workaround);
