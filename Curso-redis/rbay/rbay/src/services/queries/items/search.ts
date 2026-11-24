import { client } from "$services/redis";
import { deserialize } from "./deserialize";
import { itemsIndexKey } from "$services/keys";


export const searchItems = async (term: string, size: number = 5) => {
    const cleaned = term
    .replaceAll(/[^a-zA-Z0-9]/g, '')
    .trim()
    .split('')
    .map((word) => (word ? `%${word}%` : ''))
    .join(' ');

    //mirar en cleaned y aseguarar que sea valido
    if (cleaned === '')
        {
            return [];
        }
    


        const query = `(@name:(${cleaned}) => { $weight: 5.0}) | (@description:(${cleaned}))`

    //Usar el cliente para hacer una busqueda
    const results = await client.ft.search(itemsIndexKey(), query, {
            LIMIT: {
                from: 0,
                size
            }
        });
        
    
    //deserializar y retornar la busqueda de los resultados
    return results.documents.map(({id, value}) => deserialize(id, value as any))


};


//when i put the word chair for example, it shows me results(thats good, we solve the last issue), now, i not testing the serching function yet just the search bar who shows me similitudes, the problem is when i put chair in the search bar shows other items no what i put