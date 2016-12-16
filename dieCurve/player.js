/**
 * Created by David on 14. 12. 2016.
 */
function Player(id, direction,cX, cY, color)
{
    this.id = id;
    this.direction = direction;
    this.cX = cX;
    this.cY = cY;
    this.color = color;
}

Player.prototype= {

    left: function()
    {
        this.direction-=10;
    },
    right: function () {
        this.direction+=10;
    }
}
module.exports = Player;