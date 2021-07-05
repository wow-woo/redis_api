import express from 'express';
import axios from 'axios';
import redis from 'redis';

const app = express();
const redisClient = redis.createClient();
redisClient.on('connect', (ch, message)=>{
	console.log('redis running...', ch, ' ', message);
})

const cashRedis = (key, cb)=>{
	return new Promise((resolve, reject)=>{

	redisClient.get(key, async(err, reply)=>{
		if (err) reject();
		if(reply){
			console.log('from cash');
			resolve(reply)
		} else{
			const {data}= await cb();

			redisClient.set(key, JSON.stringify(data), (err, reply)=>{
			console.log('set! ', reply);
			})
			resolve(data)
		}
	});
	})
}

app.get('/', (req,res)=>{
res.send('<h1>Hello world</h1>')
});

app.get('/users', async(req, res)=>{
	const target ='https://random-data-api.com/api/users/random_user' 
	const key = 'users';
	
	const data = await cashRedis(key,()=>{
		return axios.get(target)
	});
	console.log('data ' , data);

	return res.json(data);
})

app.listen(4000,()=>{
	console.log('running...')
})