/**
 * Created by David on 14. 12. 2016.
 */
function Player(id, direction,cX, cY, color,name)
{
    this.id = id;
    this.direction = direction;
    this.cX_old = cX;
    this.cX = cX;
    this.cY_old = cY;
    this.cY = cY;
    this.color = color;
    this.playing = false;
    this.score = 0;
    this.name = name;
    this.ready = false;
}

Player.prototype= {

    left: function()
    {
        this.direction-=5;
    },
    right: function () {
        this.direction+=5;
    },
    updateCoordinates: function()
    {
        // this.cX = this.cX * Math.cos(this.direction);
        // this.cY = this.cY * Math.sin(this.direction);
        this.cX_old = this.cX;
        this.cY_old = this.cY;
        this.cX = this.cX + Math.cos(this.direction * Math.PI / 180) * 3;
        this.cY = this.cY + Math.sin(this.direction * Math.PI / 180) * 3;
    }

}
module.exports = Player;