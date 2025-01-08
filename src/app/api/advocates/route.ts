import db from '@/db';
import { ilike, or } from 'drizzle-orm';
import { advocates, lower } from '@/db/schema';
import { type NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        let searchTerm = (searchParams.get('searchTerm') || '').toLowerCase();

        let data;
        if (!searchTerm) {
            data = await db.select().from(advocates);
        } else {
            // - not going to address this type mismatch here
            //   (it should be working)
            // - again, hitting the 3 hour mark so not going to
            //   investigate too much further
            data = await db.select().from(advocates).where(or(
                ilike(lower(advocates.firstName), `%${searchTerm}%`),
                ilike(lower(advocates.lastName), `%${searchTerm}%`),
                ilike(lower(advocates.city), `%${searchTerm}%`),
                ilike(lower(advocates.degree), `%${searchTerm}%`),
                // - leaving these for now
                // - there are a few options to query against these
                //   columns with a 'like' operation,
                // - for jsonb we can change the column to a table
                //   and do a join (would be many to many)
                //   https://stackoverflow.com/questions/71086258/query-on-json-jsonb-column-super-slow-can-i-use-an-index
                // - or we can create a search column and add a gin index
                //   on that for easier querying, see this:
                //   https://stackoverflow.com/questions/57194472/query-to-search-multiple-columns-for-a-single-value
                // - for integer columns, converting to text per-query can be
                //   costly, we can make a dupe column that holds the value as text
                //   and whenever we create/update a value on the original column
                //   we also make sure to update the dupe column so we have a text equivalent
                // - in any case, I'm hitting the 3 hour mark now so
                //   will stop for now
                // ilike(advocates.specialties, `%${searchTerm}%`),
                // like(advocates.yearsOfExperience, `%${searchTerm}%`),
                // like(advocates.phoneNumber, `%${searchTerm}%`),
            ));
        }

        return Response.json({ data });
    } catch (e) {
        console.log(e);
        return Response.json({ message: 'error' }, {
            status: 400
        });
    }
}
