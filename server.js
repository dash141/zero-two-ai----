import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app=express(), PORT=Number(process.env.PORT)||3000, MODEL=process.env.GEMINI_MODEL||"gemini-3.8-flash";
app.use(express.json({limit:"1mb"}));
app.get("/",(_req,res)=>res.send("<h1>Zero Two AI backend is running</h1><p><a href='/api/health'>Health check</a></p><p>Open port 5173 for the chat UI.</p>"));
app.get("/api/health",(_req,res)=>res.json({ok:true,service:"Zero Two AI",model:MODEL,apiKeyConfigured:Boolean(process.env.GEMINI_API_KEY)}));
app.post("/api/chat",async(req,res)=>{
 try{
  const key=process.env.GEMINI_API_KEY;
  if(!key||key==="PASTE_YOUR_GEMINI_API_KEY_HERE")return res.status(500).json({error:"Gemini API key missing. Add it to the root .env file."});
  const message=typeof req.body?.message==="string"?req.body.message.trim():"";
  if(!message)return res.status(400).json({error:"The message field is empty. Expected { message: 'your text' }."});
  const history=Array.isArray(req.body?.history)?req.body.history:[];
  const contents=history.filter(x=>x&&["user","model","assistant"].includes(x.role)&&typeof x.text==="string"&&x.text.trim()).slice(-16).map(x=>({role:x.role==="assistant"?"model":x.role,parts:[{text:x.text.slice(0,3000)}]}));
  while(contents.length&&contents[contents.length-1].role==="user")contents.pop();
  contents.push({role:"user",parts:[{text:message.slice(0,4000)}]});
  const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:"You are Zero Two, a fictional anime-inspired character: confident, playful, teasing, and warm. Respond naturally to the user's exact message. If greeted, greet them back. Be conversational and do not return an empty answer. Do not claim to be a real human."}]},contents,generationConfig:{temperature:0.9,maxOutputTokens:700}})});
  const data=await upstream.json().catch(()=>({}));
  if(!upstream.ok){console.error("Gemini error",upstream.status,data?.error?.message);return res.status(upstream.status).json({error:data?.error?.message||`Gemini returned HTTP ${upstream.status}`,status:upstream.status});}
  const reply=(data.candidates||[]).flatMap(c=>c.content?.parts||[]).map(p=>typeof p.text==="string"?p.text:"").join("").trim();
  if(!reply){const reason=data.promptFeedback?.blockReason||data.candidates?.[0]?.finishReason||"No text returned";console.error("Gemini empty reply:",reason);return res.status(502).json({error:`Gemini returned no text (${reason}). Check the model name and API response.`,reason});}
  res.json({reply});
 }catch(e){console.error("Chat server error:",e.message);res.status(500).json({error:"Chat server could not complete the request.",details:e.message});}
});
app.listen(PORT,"0.0.0.0",()=>console.log(`Zero Two backend on port ${PORT}; model=${MODEL}; API key configured=${Boolean(process.env.GEMINI_API_KEY)}`));
