// mChess Handbuch – Seiten je Figur, je Seite bis zu zwei animierte Beispiele.
// pos: "Figur@Feld" (groß = Weiß), win: sichtbarer Ausschnitt "von:bis", show: Feld, dessen Zugziele gezeigt werden,
// seq: Züge der Animation (uci, Umwandlung mit Buchstabe), turn: wer beginnt (Standard w), alt: Züge wechseln die Farbe, cast: Rochaderechte
const HANDBOOK=[
{k:'k',name:'König',val:'unbezahlbar',pages:[
 [{t:'So zieht der König',x:'Der König zieht immer nur ein Feld weit – nach vorn, zurück, zur Seite oder schräg. Die Punkte zeigen alle Felder, die er erreichen kann.',pos:'K@d4',win:'b2:f6',show:'d4',seq:['d4e5','e5d4']},
  {t:'Der König schlägt',x:'Steht eine gegnerische Figur direkt neben ihm, darf der König sie schlagen – aber nur, wenn sie von keiner anderen Figur geschützt wird.',pos:'K@d4 p@e5',win:'b2:f6',show:'d4',seq:['d4e5']}],
 [{t:'Nie ins Schach',x:'Der König darf nie auf ein Feld ziehen, das angegriffen wird. Hier bewacht der schwarze Turm die ganze Reihe über dem König.',pos:'K@c3 r@a4',win:'a1:e5',show:'c3',seq:['c3d2']},
  {t:'Schach abwehren',x:'Wird der König angegriffen, steht er im Schach und muss sich sofort retten: wegziehen, eine Figur dazwischenstellen oder den Angreifer schlagen.',pos:'K@c2 r@c5',win:'a1:e5',show:'c2',seq:['c2d2']}],
 [{t:'Kurze Rochade',x:'Einmal pro Partie dürfen König und Turm zusammen ziehen: Der König geht zwei Felder zum Turm, der Turm springt über ihn. Beide dürfen vorher noch nicht gezogen haben.',pos:'K@e1 R@h1 P@f2 P@g2 P@h2',win:'a1:h3',cast:'K',seq:['e1g1']},
  {t:'Lange Rochade',x:'Zur anderen Seite heißt sie lange Rochade. Der König darf dabei nicht im Schach stehen und über kein angegriffenes Feld ziehen.',pos:'K@e1 R@a1 P@a2 P@b2 P@c2',win:'a1:h3',cast:'Q',seq:['e1c1']}]]},
{k:'q',name:'Dame',val:'9 Punkte',pages:[
 [{t:'So zieht die Dame',x:'Die Dame zieht beliebig weit gerade und schräg – so weit sie will, bis eine Figur im Weg steht. Sie ist die stärkste Figur.',pos:'Q@d4',win:'b2:f6',show:'d4',seq:['d4f6','f6b6']},
  {t:'Die Dame schlägt',x:'Die Dame schlägt auf jedem Feld, das sie erreichen kann. Springen kann sie aber nicht: Hier versperrt der eigene Bauer den Weg nach oben.',pos:'Q@d3 P@d5 p@f5',win:'b2:f6',show:'d3',seq:['d3f5']}],
 [{t:'Pass gut auf sie auf',x:'Die Dame ist 9 Punkte wert – so viel wie ein Turm und ein Läufer zusammen. Hier greift der Springer sie an, also bringt sie sich in Sicherheit.',pos:'Q@d4 n@c6',win:'b2:f6',show:'d4',seq:['d4e4']},
  {t:'Matt mit der Dame',x:'Zusammen mit dem eigenen König kann die Dame mattsetzen: Der schwarze König steht im Schach und hat kein Feld mehr.',pos:'K@f6 Q@d7 k@h8',win:'d5:h8',seq:['d7g7']}]]},
{k:'r',name:'Turm',val:'5 Punkte',pages:[
 [{t:'So zieht der Turm',x:'Der Turm zieht beliebig weit gerade: nach vorn, zurück und zur Seite – aber nie schräg.',pos:'R@d4',win:'b2:f6',show:'d4',seq:['d4d6','d6b6']},
  {t:'Der Turm schlägt',x:'Der Turm schlägt die erste gegnerische Figur auf seiner Linie. Über Figuren springen kann er nicht – hier blockiert der eigene Bauer.',pos:'R@b2 P@b4 p@e2',win:'a1:e5',show:'b2',seq:['b2e2']}],
 [{t:'Der Turm bei der Rochade',x:'Bei der Rochade springt der Turm über den König. Das ist der einzige Zug, bei dem ein Turm über eine Figur hinweggeht.',pos:'K@e1 R@h1',win:'a1:h2',cast:'K',seq:['e1g1']}]]},
{k:'b',name:'Läufer',val:'3 Punkte',pages:[
 [{t:'So zieht der Läufer',x:'Der Läufer zieht beliebig weit schräg – in alle vier Richtungen.',pos:'B@d4',win:'b2:f6',show:'d4',seq:['d4f6','f6d4']},
  {t:'Immer dieselbe Farbe',x:'Ein Läufer bleibt immer auf seiner Feldfarbe. Darum hat jeder Spieler einen Läufer für die hellen und einen für die dunklen Felder.',pos:'B@c1',win:'a1:e5',show:'c1',seq:['c1e3','e3c5','c5a3']}],
 [{t:'Der Läufer schlägt',x:'Auch geschlagen wird schräg – und nur die erste Figur auf der Linie. Die Figur dahinter ist geschützt.',pos:'B@b2 p@d4 p@e5',win:'a1:e5',show:'b2',seq:['b2d4']}]]},
{k:'n',name:'Springer',val:'3 Punkte',pages:[
 [{t:'So springt der Springer',x:'Der Springer springt im L: zwei Felder gerade und dann eins zur Seite. Er landet immer auf einem Feld der anderen Farbe.',pos:'N@d4',win:'b2:f6',show:'d4',seq:['d4e6','e6d4','d4b3']},
  {t:'Über Figuren springen',x:'Als einzige Figur darf der Springer über andere Figuren springen – egal ob eigene oder gegnerische.',pos:'N@b1 P@a2 P@b2 P@c2 P@d2',win:'a1:e5',show:'b1',seq:['b1c3']}],
 [{t:'Der Springer schlägt',x:'Der Springer schlägt die Figur auf dem Feld, auf dem er landet.',pos:'N@c3 p@d5',win:'b2:f6',show:'c3',seq:['c3d5']},
  {t:'Die Springergabel',x:'Ein Springer kann zwei Figuren gleichzeitig angreifen. Das nennt man Gabel – hier greift er König und Turm an.',pos:'N@d5 k@e8 r@a8',win:'a5:e8',seq:['d5c7']}]]},
{k:'p',name:'Bauer',val:'1 Punkt',pages:[
 [{t:'Vorwärts marsch',x:'Der Bauer zieht ein Feld nach vorn. Vom Startfeld aus darf er auch zwei Felder auf einmal ziehen. Rückwärts geht nie.',pos:'P@d2',win:'b1:f5',show:'d2',seq:['d2d4','d4d5']},
  {t:'Schräg schlagen',x:'Geschlagen wird schräg nach vorn. Steht direkt vor dem Bauern eine Figur, ist er blockiert.',pos:'P@d4 p@d5 p@e5',win:'b2:f6',show:'d4',seq:['d4e5']}],
 [{t:'Umwandlung',x:'Erreicht ein Bauer die letzte Reihe, wird er umgewandelt – meistens in eine Dame. Er darf aber auch Turm, Läufer oder Springer werden.',pos:'P@e6',win:'c5:g8',show:'e6',seq:['e6e7','e7e8q']},
  {t:'En passant',x:'Zieht ein gegnerischer Bauer zwei Felder und landet direkt neben deinem Bauern, darfst du ihn sofort so schlagen, als wäre er nur eins gezogen.',pos:'P@e5 p@d7',win:'b4:f8',turn:'b',alt:true,seq:['d7d5','e5d6']}]]}
];
