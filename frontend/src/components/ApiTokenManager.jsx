// 'use client';

// import { useState, useEffect } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from '@/components/ui/dialog';

// import { KeyRound, Copy, Check, Trash2 } from 'lucide-react';

// export function ApiTokenManager() {

//     const [token, setToken] = useState(null);
//     const [open, setOpen] = useState(false);
//     const [copied, setCopied] = useState(false);

//     useEffect(() => {
//         const savedToken = localStorage.getItem('verasity_api_token');
//         setToken(savedToken);
//     }, []);

//     const generateTokenMutation = useMutation({
//         mutationFn: async ({ name, email }) => {

//             const res = await fetch('/api/auth/token', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name, email }),
//             });

//             if (!res.ok) {
//                 throw new Error('Failed to generate token');
//             }

//             return res.json();
//         },

//         onSuccess: (data) => {
//             setToken(data.token);
//             localStorage.setItem('verasity_api_token', data.token);
//             toast.success('API Token generated!');
//         },

//         onError: (error) => {
//             toast.error(error.message || 'Failed to generate token');
//         },
//     });

//     const handleGenerate = (e) => {

//         e.preventDefault();

//         const formData = new FormData(e.currentTarget);

//         const name = formData.get('name');
//         const email = formData.get('email');

//         if (!name || !email) {
//             toast.error('Name and email are required');
//             return;
//         }

//         generateTokenMutation.mutate({ name, email });
//     };

//     const handleCopy = () => {

//         if (!token) return;

//         navigator.clipboard.writeText(token);
//         setCopied(true);

//         toast.success('Token copied');

//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (

//         <Dialog open={open} onOpenChange={setOpen}>

//             <DialogTrigger asChild>

//                 <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/[0.03] group cursor-pointer">

//                     <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.06] flex items-center justify-center">
//                         <KeyRound className="h-4 w-4" />
//                     </div>

//                     <div className="flex flex-col">
//                         <span className="text-sm font-medium leading-none">
//                             {token ? 'API Token' : 'Connect'}
//                         </span>

//                         <span className="text-[10px] text-muted-foreground mt-0.5">
//                             {token ? '••••' + token.slice(-6) : 'Generate token'}
//                         </span>
//                     </div>

//                     {token && (
//                         <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
//                     )}

//                 </button>

//             </DialogTrigger>

//             <DialogContent className="sm:max-w-md glass-heavy border-white/[0.08]">

//                 <DialogHeader>
//                     <DialogTitle className="text-lg">
//                         API Access Token
//                     </DialogTitle>

//                     <DialogDescription className="text-muted-foreground text-sm">
//                         Use this token to authenticate from the Chrome Extension or via the API.
//                     </DialogDescription>
//                 </DialogHeader>

//                 {token ? (

//                     <div className="flex flex-col gap-4 pt-2">

//                         <div className="flex items-center gap-2">

//                             <Input
//                                 value={token}
//                                 readOnly
//                                 className="bg-white/[0.03] border-white/[0.08] font-mono text-xs"
//                             />

//                             <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="outline"
//                                 className="flex-shrink-0 border-white/[0.08]"
//                                 onClick={handleCopy}
//                             >

//                                 {copied
//                                     ? <Check className="h-4 w-4 text-emerald-400" />
//                                     : <Copy className="h-4 w-4" />
//                                 }

//                             </Button>

//                         </div>

//                         <p className="text-xs text-muted-foreground/60">
//                             Keep this token secure. Use it in the Chrome Extension popup or via the Authorization header.
//                         </p>

//                         <Button
//                             variant="outline"
//                             className="border-red-500/20 text-red-400 hover:bg-red-500/10"
//                             onClick={() => {

//                                 localStorage.removeItem('verasity_api_token');
//                                 setToken(null);

//                                 toast.success('Token cleared');
//                             }}
//                         >

//                             <Trash2 className="w-4 h-4 mr-2" />
//                             Remove Token

//                         </Button>

//                     </div>

//                 ) : (

//                     <form onSubmit={handleGenerate} className="flex flex-col gap-4 pt-2">

//                         <div className="space-y-2">

//                             <Label htmlFor="name" className="text-xs">
//                                 Token Name
//                             </Label>

//                             <Input
//                                 id="name"
//                                 name="name"
//                                 placeholder="e.g. My Extension"
//                                 required
//                                 className="bg-white/[0.03] border-white/[0.08] text-sm"
//                             />

//                         </div>

//                         <div className="space-y-2">

//                             <Label htmlFor="email" className="text-xs">
//                                 Email
//                             </Label>

//                             <Input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 placeholder="you@example.com"
//                                 required
//                                 className="bg-white/[0.03] border-white/[0.08] text-sm"
//                             />

//                         </div>

//                         <Button
//                             type="submit"
//                             disabled={generateTokenMutation.isPending}
//                             className="mt-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0"
//                         >

//                             {generateTokenMutation.isPending
//                                 ? 'Generating...'
//                                 : 'Generate Token'
//                             }

//                         </Button>

//                     </form>

//                 )}

//             </DialogContent>

//         </Dialog>

//     );
// }