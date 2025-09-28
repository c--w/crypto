// pattern.js
class RandomPattern {
    static get inputProperties() {
        return [];
    }

    paint(ctx, geom, properties) {
        const { width, height } = geom;
        console.log(width, height);
        const cellSize = Math.random() * 20 + 10;

        function circles(ctx, x, y, cellSize) {
            const hue = Math.floor(Math.random() * 360);
            ctx.fillStyle = `hsl(${hue}, 70%, 95%)`;
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }
        function squares(ctx, x, y, cellSize) {
            const angle = Math.random() * Math.PI;
            const hue = Math.floor(Math.random() * 360);

            ctx.save();
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(${hue}, 60%, 95%)`;
            ctx.fillRect(-cellSize / 2.5, -cellSize / 2.5, cellSize / 1.25, cellSize / 1.25);
            ctx.restore();
        }
        function triangles(ctx, x, y, cellSize) {
            const angle = Math.random() * Math.PI;
            const hue = Math.floor(Math.random() * 360);

            ctx.save();
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(${hue}, 60%, 95%)`;
            ctx.beginPath();
            ctx.moveTo(0, -cellSize / 2.5);
            ctx.lineTo(-cellSize / 2.5, cellSize / 2.5);
            ctx.lineTo(cellSize / 2.5, cellSize / 2.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        function hexagons(ctx, x, y, cellSize) {
            const angle = Math.random() * Math.PI;
            const hue = Math.floor(Math.random() * 360);
            const radius = cellSize / 2.5;
            const sideLength = radius * Math.sqrt(3);
            ctx.save();
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(${hue}, 60%, 95%)`;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const theta = (i / 6) * 2 * Math.PI;
                const px = radius * Math.cos(theta);
                const py = radius * Math.sin(theta);
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        const actions = [circles, squares, triangles, hexagons];
        const randomIndex = Math.floor(Math.random() * actions.length);

        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                actions[randomIndex](ctx, x, y, cellSize);
            }
        }
    }

}

registerPaint('random-pattern', RandomPattern);
