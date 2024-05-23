import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt"

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
	Variables : {
		userId: string
	}
}>();

 
// Middleware 

blogRouter.use('/*', async (c, next) => {
  
    // get header
    const header = c.req.header("authorization") || "";
  
    const token = header.split(" ")[1];
  
    // verify header
    const response = await verify(token,c.env.JWT_SECRET);
    // check if header is correct,if yes proceed
    if(response){
        c.set("userId",response.id);
      
    }else {
      c.status(403);
      return c.json({error : "Unauthorize"})
    }
    // if not give 403
   
    await next()
  });
  
    
 // Bulk  get blog route----------------------------------------------
 blogRouter.get('/bulk',async  (c) => {
    // const id = c.req.param("id");
    // console.log(id);
    console.log("bulk call");

    try{

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const post = await prisma.post.findMany()// should use pagination
    return c.json({post});  
    }catch(e){
        c.status(403);
        return c.json({error: "Error while fetching blogs"})
    }
  })


// Get blog route----------------------------------------------
blogRouter.get('/:id',async  (c) => {
    // const id = c.req.param("id");
    // console.log(id);
    try{

    const id = await c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const post = await prisma.post.findFirst({
        where : {
            id : id
        },
       })

    return c.json({post});  
    }catch(e){
        c.status(403);
        return c.json({error: "Error while fetching blogs"})
    }
  })


   
 

  
  // POst blog route----------------------------------------------
  
blogRouter.post("/", async (c) => {

    const body = await c.req.json();
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const blog = await prisma.post.create({
 
        data :{
            title : body.title,
            content : body.content,
            authorId : authorId

        }
    })

    return c.json({id : blog.id});
})

// Put blog route----------------------------------------------
blogRouter.put("/", async (c) => {
    
    const body = await c.req.json();
    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const blog = await prisma.post.update({
        where : {
            id : body.id
        },
       data :{
            title : body.title,
            content : body.content,
            authorId : authorId

        }
    })

    return c.json({id : blog.id});
})

  