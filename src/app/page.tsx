import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

import { GamePage } from '@/components/game/GamePage';

export default function Home() {
  return <GamePage roomId="default" />;
}

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-background py-10">
//       <div className="mx-auto w-full max-w-6xl px-4">
//         {/* Newspaper frame */}
//         <div className="rounded-lg border bg-background shadow-sm">
//           {/* Masthead */}
//           <header className="border-b px-6 py-5">
//             <div className="flex flex-wrap items-baseline justify-between gap-3">
//               <div className="space-y-1">
//                 <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                   Saturday Edition · Live Puzzle
//                 </p>
//                 <h1 className="text-3xl font-bold tracking-tight font-serif">
//                   Typing Rivals
//                 </h1>
//               </div>
// 
//               <div className="text-right">
//                 <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                   Round ends in
//                 </p>
//                 <p className="font-mono text-lg">00:27</p>
//               </div>
//             </div>
//           </header>
// 
//           {/* Content grid */}
//           <div className="grid grid-cols-1 gap-8 px-6 py-7 lg:grid-cols-12">
//             {/* LEFT COLUMN */}
//             <section className="space-y-6 lg:col-span-7">
//               <div className="space-y-1">
//                 <p className="text-sm text-muted-foreground">
//                   You&apos;re playing as <span className="font-medium">John</span>
//                 </p>
//               </div>
// 
//               <Card className="shadow-none">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
//                     Sentence
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="font-serif text-lg leading-relaxed">
//                     The quick brown fox jumps over the lazy dog.
//                   </p>
//                   <Separator className="my-4" />
//                   <div className="flex flex-wrap gap-6">
//                     <div>
//                       <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                         Your WPM
//                       </p>
//                       <p className="font-mono text-lg">32</p>
//                     </div>
//                     <div>
//                       <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                         Accuracy
//                       </p>
//                       <p className="font-mono text-lg">0.97</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
// 
//               <Card className="shadow-none">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
//                     Type
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <textarea
//                     className="w-full min-h-[130px] resize-none rounded-md border bg-background p-3 font-mono text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
//                     placeholder="Start typing here..."
//                     spellCheck={false}
//                   />
//                 </CardContent>
//               </Card>
//             </section>
// 
//             {/* RIGHT COLUMN */}
//             <aside className="space-y-6 lg:col-span-5">
//               <div className="space-y-2">
//                 <h2 className="text-xl font-semibold tracking-tight font-serif">
//                   Live Leaderboard
//                 </h2>
//                 <Separator />
//                 <p className="text-xs text-muted-foreground">
//                   Updates in real time. Progress shows what each player is typing *now*.
//                 </p>
//               </div>
// 
//               <Card className="shadow-none">
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="w-[45%]">Live progress</TableHead>
//                         <TableHead>Player</TableHead>
//                         <TableHead className="text-right">WPM</TableHead>
//                         <TableHead className="text-right">Accuracy</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       <TableRow>
//                         <TableCell className="font-mono text-sm">
//                           The quick brown fo…
//                         </TableCell>
//                         <TableCell className="font-medium">super-typer</TableCell>
//                         <TableCell className="text-right font-mono">30</TableCell>
//                         <TableCell className="text-right font-mono">0.97</TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell className="font-mono text-sm">
//                           The quick brwn…
//                         </TableCell>
//                         <TableCell className="font-medium">slow-but-true</TableCell>
//                         <TableCell className="text-right font-mono">18</TableCell>
//                         <TableCell className="text-right font-mono">0.92</TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </aside>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }