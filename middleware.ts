import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';
const protectedRoutes=['/dashboard','/analyze','/understand','/workspace','/reader','/library','/history','/checker','/developer-tools','/settings'];
const authRoutes=['/login','/signup','/auth'];
export async function middleware(request:NextRequest){
 const pathname=request.nextUrl.pathname;
 const isProtected=protectedRoutes.some(p=>pathname===p||pathname.startsWith(p+'/'));
 const isAuth=authRoutes.some(p=>pathname===p);
 if(!isProtected&&!isAuth)return NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key){if(isProtected){const dest=request.nextUrl.clone();dest.pathname='/login';dest.searchParams.set('next',pathname);return NextResponse.redirect(dest)}return NextResponse.next({request});}
 let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookies){cookies.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user},error}=await supabase.auth.getUser();
 if(isProtected&&(!user||error)){const dest=request.nextUrl.clone();dest.pathname='/login';dest.searchParams.set('next',pathname);const redirect=NextResponse.redirect(dest);response.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie));return redirect}
 if(isAuth&&user){const dest=request.nextUrl.clone();dest.pathname='/dashboard';dest.search='';const redirect=NextResponse.redirect(dest);response.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie));return redirect}
 return response;
}
export const config={matcher:['/dashboard/:path*','/analyze/:path*','/understand/:path*','/workspace/:path*','/reader/:path*','/library/:path*','/history/:path*','/checker/:path*','/developer-tools/:path*','/settings/:path*','/login','/signup','/auth']};
