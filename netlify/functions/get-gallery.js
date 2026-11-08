import { v2 as cloudinary } from 'cloudinary';
// Retained for existing consumers. The rebuilt pages use CMS-managed static media.
export const handler = async (event) => {
  const headers = { 'Content-Type':'application/json', 'Cache-Control':'public, max-age=300, stale-while-revalidate=600' };
  if(event.httpMethod !== 'GET') return { statusCode:405, headers:{...headers,Allow:'GET'},body:JSON.stringify({error:'Method not allowed'}) };
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET }=process.env;
  if(!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return {statusCode:503,headers:{...headers,'Cache-Control':'no-store'},body:JSON.stringify({error:'The gallery is temporarily unavailable'})};
  cloudinary.config({cloud_name:CLOUDINARY_CLOUD_NAME,api_key:CLOUDINARY_API_KEY,api_secret:CLOUDINARY_API_SECRET});
  try {
    const result=await cloudinary.search.expression('resource_type:image AND folder:AFG-Church-Gallery').sort_by('created_at','desc').max_results(20).execute();
    return {statusCode:200,headers,body:JSON.stringify(result.resources.map(img=>({url:img.secure_url,created_at:img.created_at})))};
  }catch{ return {statusCode:502,headers:{...headers,'Cache-Control':'no-store'},body:JSON.stringify({error:'The gallery is temporarily unavailable'})}; }
};
