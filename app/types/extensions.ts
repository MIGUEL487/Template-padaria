/** Extension boundaries only. No checkout, administration or API is implemented. */
export interface CartLine { productId:string; quantity:number }
export interface OnlineOrder { lines:CartLine[] }
export interface BlogEntry { slug:string; title:string }
export interface BakeryLocation { id:string; name:string; address:string }
