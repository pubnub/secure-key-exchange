function explode(msgID) {
    (function() {
        $t = $("." + msgID);

        var amount = 5;
        var width = $t.width()/amount;
        var height = $t.height()/amount;
        var totalSquares = Math.pow(amount, 2);

        var html = $t.html();

        var y = 0;

        for (var z = 0; z <= (amount*width); z = z+width) {
            $('<div class="clipped" style="clip: rect('+y+'px, '+(z+width)+'px, '+(y+height)+'px, '+z+'px)">'+html+'</div>').appendTo($t);

            if(z === (amount*width)-width) {
                y = y + height;
                z = -width;
            }
            if(y === (amount*height)) {
                z = 9999999;
            }
        }
    })();

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;   
    }

    $("#" + msgID).remove();
    
    $("." + msgID + " div:not(#" + msgID + ")").each(function() {
        var v = rand(120, 90);
        var angle = rand(80, 89);
        var theta = (angle * Math.PI) / 180;
        var g = -9.8;
                    
        var self = $(this);
        self.css({"position" : "absolute"});


        var t = 0,
            z, r, nx, ny,
            totalt =  15;
                
        var negate = [1, -1, 0];
        var direction = negate[ Math.floor(Math.random() * negate.length) ];
                
        var randDeg = rand(-5, 10);
        var randScale = rand(0.9, 1.1);
        var randDeg2 = rand(30, 5);
                
                
        $(this).css({'transform' : 'scale('+randScale+') skew('+randDeg+'deg) rotateZ('+randDeg2+'deg)'});
                 
        z = setInterval(function() {    
            var ux = ( Math.cos(theta) * v ) * direction;
            var uy = ( Math.sin(theta) * v ) - ( (-g) * t);
            nx = (ux * t);
            ny = (uy * t) + (0.5 * (g) * Math.pow(t, 2));
            $(self).css({'top' : (ny+250)+'px', 'left' : (nx+100)+'px'});
            t = t + 0.10;
            if(t > totalt) {
                  $("." + msgID).remove();
                clearInterval(z);
            }
                    
        }, 10);
        
    });
}
