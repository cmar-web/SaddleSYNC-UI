const KEY = "ss_current_user";
export function setCurrentUser(user){ try{localStorage.setItem(KEY, JSON.stringify(user));}catch{} }
export function getCurrentUser(){ try{return JSON.parse(localStorage.getItem(KEY)||"null");}catch{return null;} }
export function clearCurrentUser(){ try{localStorage.removeItem(KEY);}catch{} }
