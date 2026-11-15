// mChess Training – Lektionsdaten. Stellungen: "Figur@Feld", Großbuchstaben = Weiß, klein = Schwarz, * = Stern.
// Typen: solo (Sterne sammeln / Figuren fangen, Gegner zieht nicht), puzzle (Ziel-Zug finden), quiz (Fragen), war (Mini-Partie gegen den Trainer)
// Ziele bei puzzle: mate, ok (Liste erlaubter Züge), save (Figur auf sq retten), defend (Figur auf sq decken), kingmove, block, capcheck, escape
const ISLANDS=[
{id:'i1',name:'Figureninsel',av:'n',col:5,tr:'cpu1',desc:'Wie ziehen die Figuren?',lessons:[
 {id:'i1l1',t:'solo',title:'Turm-Sammler',pos:'R@d4 *@d8 *@h8 *@h1',par:3,text:'Der Turm zieht gerade: nach vorn, zurück und zur Seite – so weit er will. Sammle alle Sterne ein!'},
 {id:'i1l2',t:'solo',title:'Läufer-Rutsche',pos:'B@c1 *@e3 *@g5 *@d8',par:3,text:'Der Läufer zieht schräg, so weit er will. Er bleibt immer auf seiner Feldfarbe. Hol dir die Sterne!'},
 {id:'i1l3',t:'solo',title:'Dame überall',pos:'Q@d1 *@d7 *@a4 *@h4',par:3,text:'Die Dame kann gerade und schräg ziehen. Sie ist die stärkste Figur. Sammle die Sterne in wenigen Zügen!'},
 {id:'i1l4',t:'solo',title:'König-Spaziergang',pos:'K@e1 *@e3 *@g4',par:4,text:'Der König macht immer nur einen Schritt – in jede Richtung. Bring ihn zu den Sternen!'},
 {id:'i1l5',t:'solo',title:'Springer-Sprünge',pos:'N@b1 *@c3 *@e4 *@f6',par:3,text:'Der Springer springt im L: zwei Felder gerade und eins zur Seite. Er darf über andere Figuren springen!'},
 {id:'i1l6',t:'solo',title:'Bauer, voran!',pos:'P@e2 *@e4 p@d5',par:2,text:'Der Bauer zieht nach vorn, beim ersten Zug auch zwei Felder. Schlagen kann er nur schräg nach vorn. Hol den Stern und schlag den schwarzen Bauern!'},
 {id:'i1l7',t:'war',title:'Bauernkrieg',pos:'P@b2 P@c2 P@d2 P@e2 P@f2 P@g2 p@b7 p@c7 p@d7 p@e7 p@f7 p@g7',text:'Mini-Spiel gegen Igel Ida: Nur Bauern! Wer zuerst einen Bauern auf die andere Seite bringt, gewinnt.'}]},
{id:'i2',name:'Schlag-Strand',av:'p',col:1,tr:'cpu1',desc:'Schlagen und Figurenwerte',lessons:[
 {id:'i2l1',t:'solo',title:'Fang den Bauern',pos:'R@a1 p@h7',par:2,text:'Schlagen heißt: Du ziehst auf das Feld einer gegnerischen Figur und nimmst sie vom Brett. Fang den Bauern mit dem Turm!'},
 {id:'i2l2',t:'solo',title:'Springer auf Jagd',pos:'N@g1 p@d5',par:3,text:'Der Springer will den Bauern fangen. Schaffst du es in drei Sprüngen?'},
 {id:'i2l3',t:'solo',title:'Dame räumt auf',pos:'Q@d1 p@d5 p@a5 p@a8',par:3,text:'Die Dame soll alle drei Bauern schlagen. Finde den kürzesten Weg!'},
 {id:'i2l4',t:'quiz',title:'Was ist mehr wert?',text:'Figuren sind unterschiedlich viel wert: Bauer 1, Springer und Läufer 3, Turm 5, Dame 9 Punkte.',q:[
   {pos:'R@c4 B@f4',text:'Wer ist mehr wert: der Turm oder der Läufer?',opts:[['Turm',1],['Läufer',0]]},
   {pos:'Q@c4 R@f4',text:'Wer ist mehr wert: die Dame oder der Turm?',opts:[['Dame',1],['Turm',0]]},
   {pos:'N@c4 P@f4',text:'Wer ist mehr wert: der Springer oder der Bauer?',opts:[['Springer',1],['Bauer',0]]},
   {pos:'N@c4 B@f4',text:'Springer oder Läufer – wer ist mehr wert?',opts:[['Springer',0],['Läufer',0],['Gleich viel',1]]}]},
 {id:'i2l5',t:'puzzle',goal:'ok',ok:['e4d5'],title:'Guter Tausch?',pos:'K@g1 P@e4 N@f3 k@g8 q@d5 p@e5 p@d6',text:'Du kannst zwei Figuren schlagen. Welcher Tausch lohnt sich?',why:'Die Figur dort ist gedeckt – du würdest mehr verlieren, als du bekommst.'}]},
{id:'i3',name:'Wachturm',av:'r',col:4,tr:'cpu3',desc:'Angegriffen und gedeckt',lessons:[
 {id:'i3l1',t:'puzzle',goal:'save',sq:'e4',title:'Springer in Gefahr',pos:'K@g1 N@e4 p@d5 k@g8',text:'Der schwarze Bauer greift deinen Springer an. Bring den Springer in Sicherheit!'},
 {id:'i3l2',t:'puzzle',goal:'save',sq:'d4',title:'Turm in Gefahr',pos:'K@h1 R@d4 b@b6 k@g8',text:'Der Läufer greift deinen Turm an. Zieh den Turm auf ein sicheres Feld!'},
 {id:'i3l3',t:'puzzle',goal:'defend',sq:'e5',title:'Decke deinen Springer',pos:'K@g1 N@e5 Q@d1 r@e8 k@g8',text:'Der Turm greift deinen Springer an. Lass den Springer stehen und decke ihn mit der Dame!'},
 {id:'i3l4',t:'puzzle',goal:'save',sq:'d4',title:'Dame in Gefahr',pos:'K@g1 Q@d4 n@c6 k@g8',text:'Der Springer greift deine Dame an. Rette sie!'},
 {id:'i3l5',t:'quiz',title:'Bedroht oder nicht?',text:'Schau genau: Kann die markierte Figur geschlagen werden?',q:[
   {pos:'N@e4 p@d5',mark:'e4',text:'Kann der Springer geschlagen werden?',opts:[['Ja',1],['Nein',0]]},
   {pos:'R@d4 b@b5',mark:'d4',text:'Kann der Turm geschlagen werden?',opts:[['Ja',0],['Nein',1]]},
   {pos:'B@c4 r@c8',mark:'c4',text:'Kann der Läufer geschlagen werden?',opts:[['Ja',1],['Nein',0]]},
   {pos:'Q@e4 n@g6',mark:'e4',text:'Kann die Dame geschlagen werden?',opts:[['Ja',0],['Nein',1]]}]}]},
{id:'i4',name:'Königsburg',av:'k',col:0,tr:'cpu3',desc:'Schach und wie man es abwehrt',lessons:[
 {id:'i4l1',t:'quiz',title:'Ist das Schach?',text:'Schach heißt: Der König wird angegriffen. Steht der weiße König im Schach?',q:[
   {pos:'K@e1 r@e8',mark:'e1',text:'Steht der weiße König im Schach?',opts:[['Ja',1],['Nein',0]]},
   {pos:'K@e1 b@b5',mark:'e1',text:'Steht der weiße König im Schach?',opts:[['Ja',0],['Nein',1]]},
   {pos:'K@e1 n@d3',mark:'e1',text:'Steht der weiße König im Schach?',opts:[['Ja',1],['Nein',0]]},
   {pos:'K@e1 P@e2 r@e8',mark:'e1',text:'Und jetzt?',opts:[['Ja',0],['Nein',1]]}]},
 {id:'i4l2',t:'puzzle',goal:'kingmove',title:'König, weg da!',pos:'K@e1 P@d2 P@f2 r@e8 k@a8',text:'Dein König steht im Schach. Erster Weg: Zieh den König auf ein sicheres Feld!'},
 {id:'i4l3',t:'puzzle',goal:'block',title:'Dazwischen stellen',pos:'K@e1 B@c4 P@d2 P@f2 r@e8 k@a8',text:'Zweiter Weg: Stell eine Figur zwischen den Angreifer und deinen König!'},
 {id:'i4l4',t:'puzzle',goal:'capcheck',sq:'e1',title:'Schlag den Angreifer',pos:'K@g1 P@f2 P@g2 P@h2 Q@e7 r@e1 k@a8',text:'Dritter Weg: Schlag die Figur, die Schach gibt!'},
 {id:'i4l5',t:'puzzle',goal:'escape',title:'Rette den König',pos:'K@g1 P@g2 P@h2 B@d3 r@b1 k@a8',text:'Schach! Hier gehen alle drei Wege: wegziehen, dazwischenstellen oder schlagen. Finde einen!'}]},
{id:'i5',name:'Mattberg',av:'q',col:2,tr:'cpu2',desc:'Matt in einem Zug',lessons:[
 {id:'i5l1',t:'puzzle',goal:'mate',title:'Grundreihenmatt',pos:'K@g1 R@a1 k@g8 p@f7 p@g7 p@h7',text:'Matt heißt: Der König steht im Schach und kann sich nicht mehr retten. Setz Schwarz matt – in einem Zug!'},
 {id:'i5l2',t:'puzzle',goal:'mate',title:'Damenmatt',pos:'K@g6 Q@a1 k@h8',text:'Dein König hilft mit. Setz mit der Dame matt!'},
 {id:'i5l3',t:'puzzle',goal:'mate',title:'Turm-Leiter',pos:'K@a1 R@a7 R@b6 k@h8',text:'Zwei Türme arbeiten zusammen wie eine Leiter. Matt in einem Zug!'},
 {id:'i5l4',t:'puzzle',goal:'mate',title:'Dame und König',pos:'K@g6 Q@d1 k@h8',text:'Der schwarze König ist in der Ecke gefangen. Wo setzt die Dame matt?'},
 {id:'i5l5',t:'puzzle',goal:'mate',title:'Ersticktes Matt',pos:'K@g1 N@e5 k@h8 r@g8 p@g7 p@h7',text:'Der schwarze König ist von seinen eigenen Figuren eingesperrt. Der Springer setzt matt!'},
 {id:'i5l6',t:'puzzle',goal:'mate',title:'Schäfermatt',pos:'K@g1 Q@h5 B@c4 k@e8 q@d8 b@f8 n@g8 p@d7 p@e7 p@f7 p@g7',text:'Ein berühmtes Matt: Dame und Läufer zielen auf dasselbe Feld. Finde es!'}]},
{id:'i6',name:'Gabel-Bucht',av:'n',col:3,tr:'cpu2',desc:'Zwei Figuren auf einmal angreifen',lessons:[
 {id:'i6l1',t:'puzzle',goal:'ok',ok:['b5c7'],title:'Springergabel',pos:'K@g1 N@b5 k@e8 r@a8 p@f7 p@g7 p@h7',text:'Der Springer kann König und Turm gleichzeitig angreifen. Finde das Feld!',why:'Such ein Feld, von dem der Springer Schach gibt und den Turm angreift.'},
 {id:'i6l2',t:'puzzle',goal:'ok',ok:['e4f6'],title:'Königsgabel',pos:'K@g1 N@e4 k@g8 q@d7 p@f7 p@h7',text:'Schach und gleichzeitig die Dame angreifen – wohin springt der Springer?',why:'Der Springer soll Schach geben und dabei die Dame angreifen.'},
 {id:'i6l3',t:'puzzle',goal:'ok',ok:['d1d5'],title:'Damengabel',pos:'K@g1 Q@d1 k@g8 r@a8 p@g7 p@h7',text:'Die Dame greift in viele Richtungen an. Gib Schach und greif dabei den Turm an!',why:'Such ein Feld, von dem die Dame Schach gibt und den Turm in der Ecke sieht.'},
 {id:'i6l4',t:'puzzle',goal:'ok',ok:['d4d5'],title:'Bauerngabel',pos:'K@g1 P@d4 k@g8 n@c6 n@e6',text:'Auch ein kleiner Bauer kann zwei Figuren auf einmal angreifen. Zieh ihn richtig!',why:'Der Bauer schlägt schräg nach vorn – stell ihn zwischen die beiden Springer.'},
 {id:'i6l5',t:'puzzle',goal:'ok',ok:['f1c4'],title:'Läufergabel',pos:'K@h1 B@f1 k@g8 r@a2 p@g7 p@h7',text:'Der Läufer kann Schach geben und dabei den Turm angreifen. Wohin zieht er?',why:'Such ein Feld, von dem der Läufer Schach gibt und den Turm auf a2 sieht.'}]},
{id:'i7',name:'Fesselfelsen',av:'b',col:5,tr:'cpu3',desc:'Fesseln, Spieße und Abzüge',lessons:[
 {id:'i7l1',t:'puzzle',goal:'ok',ok:['d4d5'],title:'Gefesselt!',pos:'K@g1 B@b5 P@d4 k@e8 n@c6 p@b7 p@h7',text:'Der Springer ist an seinen König gefesselt – er darf nicht wegziehen. Greif ihn an!',why:'Greif den gefesselten Springer mit dem Bauern an.'},
 {id:'i7l2',t:'puzzle',goal:'ok',ok:['f2f4'],title:'Turm fesselt Läufer',pos:'K@g1 R@e1 P@f2 k@e8 b@e5 p@d6 p@a7',text:'Der schwarze Läufer darf die e-Linie nicht verlassen, sonst steht sein König im Schach. Nutz das aus!',why:'Greif den gefesselten Läufer mit einem Bauern an.'},
 {id:'i7l3',t:'puzzle',goal:'ok',ok:['f1c4'],title:'Läufer-Spieß',pos:'K@b1 B@f1 k@e6 q@g8',text:'König und Dame stehen auf einer Diagonale. Gib Schach – danach ist die Dame dran!',why:'Gib mit dem Läufer Schach, sodass die Dame hinter dem König steht.'},
 {id:'i7l4',t:'puzzle',goal:'ok',ok:['a1a4'],title:'Turm-Spieß',pos:'K@g1 R@a1 k@d4 q@h4',text:'König und Dame stehen auf derselben Reihe. Wie gewinnt der Turm die Dame?',why:'Gib mit dem Turm Schach auf der Reihe von König und Dame.'},
 {id:'i7l5',t:'puzzle',goal:'ok',ok:['e4c5','e4f6'],title:'Abzugsschach',pos:'K@g1 R@e1 N@e4 k@e8 q@d7',text:'Der Springer versperrt dem Turm den Weg. Zieht er weg, gibt der Turm Schach – und der Springer greift dabei die Dame an!',why:'Der Springer soll wegziehen und dabei die Dame angreifen.'}]},
{id:'i8',name:'Meistergipfel',av:'k',col:4,tr:'cpu4',desc:'Berühmte Mattbilder',lessons:[
 {id:'i8l1',t:'puzzle',goal:'mate',title:'Dame auf der Grundreihe',pos:'K@g1 Q@d1 k@g8 p@f7 p@g7 p@h7',text:'Die eigenen Bauern sperren den König ein. Matt in einem Zug!'},
 {id:'i8l2',t:'puzzle',goal:'mate',title:'Arabisches Matt',pos:'K@g1 R@b7 N@f6 k@h8',text:'Turm und Springer arbeiten zusammen. Wo setzt der Turm matt?'},
 {id:'i8l3',t:'puzzle',goal:'mate',title:'Dame und Läufer',pos:'K@g1 Q@h5 B@d3 k@g8 r@f8 p@f7 p@g7',text:'Der Läufer zielt auf h7. Die Dame setzt matt!'},
 {id:'i8l4',t:'puzzle',goal:'mate',title:'Dame und Springer',pos:'K@g1 Q@h5 N@g5 k@g8 r@f8 p@f7 p@g7',text:'Der Springer deckt das wichtige Feld. Wo setzt die Dame matt?'},
 {id:'i8l5',t:'puzzle',goal:'mate',title:'Epaulettenmatt',pos:'K@g1 Q@a2 k@e8 r@d8 r@f8',text:'Die eigenen Türme stehen dem König im Weg wie Schulterklappen. Matt in einem Zug!'}]}
];
