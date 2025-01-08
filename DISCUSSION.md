### Approach
The 2 primary criteria I followed when tackling this were:
1. keep it simple - don't over-abstract, don't make too many files (makes it harder to review the assignment).
2. tackle low-hanging fruit first - this creates a faster feedback loop so I can get more familiar with what I'm working with.

With that in mind, let me explain what I did and why.

### Front-end first
I decided to work on the front-end first because it had the most low-hanging fruit. The other reason was because it required less setup - I could start getting my hands dirty with the code so I'm more familiar with it. Finally, I wanted to get the code to a clean state before adding any new functionality, and the back-end didn't really have any bugs to fix (not saying that there aren't things that can be changed to make it more efficient for usage, but it worked fine once set-up, so no glaring things to address right off the bat).

After fixing obvious bugs, and cleaning up the anti-patterns/unnecessary code, I decided to do give the UI a simple facelift. Since I was already working on the front-end, it made sense to just finish off the rest of the work I had planned for it anyway. The main goal of updating the UI was to make it easier to use and understand - more intuitive. Keeping with the 'keep it simple' approach, I wanted to update the UI just enough for it to do it's job - no extra bells and whistles. A good cohesive design takes time, so my philosophy is to keep UI as simple as possible - using mainly a white/gray color palette, with just 1 extra primary color (which is the green one I got from solace's website).

### Back-end
At this point I was already around the 2 hour mark, but I didn't want to submit the assignment without setting up some simple back-end functionality - I wanted to at least get the advocate list coming from the DB, and have some basic search functionality. Just want to point out that I've never used the drizzle ORM before, but it was pretty easy to work with, and the docs were helpful.

In any case, I got the DB setup, and I changed the ID field for the advocates to a UUID - I generally prefer UUIDs over integers (more future proof in case the system needs to be used with other systems). This allowed me to use the DB for fetching the list of advocates, which also required me to update the front-end so the filtering/search happens via API request rather than a front-end filter.

I didn't fully implement the search (especially on the jsonb and int columns) because by the point I had hit the 3 hour mark and getting those columns searchable would have required at least another hour of work (which I'm happy to do if the team wants me to - I stopped at 3 hours because I've been told that I "didnt follow directions" in previous interviews for going over the time too much). I did outline some approaches (in the code) I would take to make those columns searchable (which I'll also paste below).

from the code:
```
// - there are a few options to query against these
//   columns with a 'like' operation,
// - for jsonb we can change the column to a table
//   and do a join (would be many to many)
//   - this would also make it so these values are references to a
//     single source of truth, rather than duplicate data
//     (which can cause problems like things spelled differently,
//     or abbreviated in one instance and not the other, etc...)
//   https://stackoverflow.com/questions/71086258/query-on-json-jsonb-column-super-slow-can-i-use-an-index
// - or we can create a search column and add a gin index
//   on that for easier querying, see this:
//   https://stackoverflow.com/questions/57194472/query-to-search-multiple-columns-for-a-single-value
// - for integer columns, converting to text per-query can be
//   costly, we can make a dupe column that holds the value as text
//   and whenever we create/update a value on the original column
//   we also make sure to update the dupe column so we have a text equivalent
```

I hope I didn't forget or miss anything - if I do think of something else I'll send a follow up email.

Thanks for taking the time to review this and I'm looking forward to hearing back!
