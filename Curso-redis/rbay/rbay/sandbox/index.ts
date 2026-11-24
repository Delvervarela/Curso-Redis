import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {

    await client.hSet('car1',
    {
        color: 'red',
        year: 1999
    });

    await client.hSet('car2',
    {
        color: 'green',
        year: 1975
    });
    await client.hSet('car3',
    {
        color: 'blue',
        year: 1950
    });

    const car = await client.hGetAll('car');

    if (Object.keys(car).length == 0){
        console.log('car not found, respond with 404');
        return;
    }

    const commands = [1, 2, 3].map((id) =>{

        return client.hGetAll('car' + id);

    })

    const results = await Promise.all(commands);

        console.log(results);
};
run();
