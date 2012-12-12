
Yamugase - the game server - allows single player, will allow anonymous and identified players, multiplayer, friendly (choose who can join)
Yamugase.Player the basis for a player. this class can be extended (see advised extension methods)
Yamugase.Game represents the basis for a Game. This class can be extended (see advised extension methods)

extend methods

and the end of each script there's allways a  
className = Yamugase.className attribution
this allows you to add members and rewrite members by calling e.g.
Game.prototype.XPTO = function(){...};
or you can allways do  

require(Yamugase/utils/object);

object_extend(A, Yamugase.B);
A.prototype.XPTO = function(){...};
B = A;
