import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, usernamesUniqueKey, usernamesKey } from '$services/keys';
import { attr } from 'svelte/internal';

export const getUserByUsername = async (username: string) => {

     //Usar el argumento del username para ver el id de las personas
     //con el set ordenado de usernames

     const decimalId = await client.zScore(usernamesKey(), username);

     // asegurarse de que se tiene un id de la busqueda
    if (!decimalId)
    {
        throw new Error('User does not exists')
    }

     // toma la id y la convierte en hexadecimal
     const id = decimalId.toString(16);
     //usa la id para buscar el hash del usuario
        const user = await client.hGetAll(usersKey(id));
     
        // deserializa y retorna el hash
        return deserialize(id, user);
};

export const getUserById = async (id: string) => {

    const user = await client.hGetAll(usersKey(id));

    return deserialize(id, user);
};


export const createUser = async (attrs: CreateUserAttrs) => {

    const id = genId();

    // ver si el username esta en un set de usernames

const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username)
    
// si es asi, muestra un error
    if (exists){

        throw new Error('Username is already taken');
   
    }

    // de otra forma continua
    await client.hSet(usersKey(id), serialize(attrs));
    await client.sAdd(usernamesUniqueKey(), attrs.username)
    await client.zAdd(usernamesKey(),
    {
    value: attrs.username,
    score: parseInt(id, 16) 
    })

    return id;
};

const serialize = (user: CreateUserAttrs) =>{
    return{

        username: user.username,
        password: user.password

    };

};

const deserialize = (id: string, user: {[key: string]: string}) =>{
    return{
        id, 
        username: user.username,
        password: user.password
    };
};