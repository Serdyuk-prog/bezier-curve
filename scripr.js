class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function drawLine(pointA, pointB, context, colour) {
    context.beginPath();
    context.moveTo(pointA.x, pointA.y);
    context.lineTo(pointB.x, pointB.y);
    context.strokeStyle = colour;
    context.stroke();
}

function drawPoint(point, context, colour) {
    radius = 5;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = colour;
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
}

function bezier(t, p0, p1, p2, p3) {
    let cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;

    let cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;

    let X = aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0.x;
    let Y = aY * Math.pow(t, 3) + bY * Math.pow(t, 2) + cY * t + p0.y;

    return new Point(X, Y);
}

function drawBezierLine(p0, p1, p2, p3, accuracy, context) {
    context.beginPath();
    for (let i = 0; i < 1; i += accuracy) {
        let p = bezier(i, p0, p1, p2, p3);
        context.lineTo(p.x, p.y);
    }
    context.stroke();
}

function getMiddlePoint(pointA, pointB) {
    const X = (pointA.x + pointB.x) / 2;
    const Y = (pointA.y + pointB.y) / 2;

    return new Point(X, Y);
}

function clearCanvas(context, canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function getDisBwnPoints(pointA, pointB) {
    return Math.sqrt(
        Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
    );
}

function getRatio(valA, valB) {
    return valA / (valA + valB);
}

function getAuxiliaryPoint(P0, P1, P2, A0, A1) {
    const P0P1 = getDisBwnPoints(P0, P1);
    const P1P2 = getDisBwnPoints(P1, P2);
    const ratio = getRatio(P0P1, P1P2);

    const X = A0.x + (A1.x - A0.x) * ratio;
    const Y = A0.y + (A1.y - A0.y) * ratio;

    return new Point(X, Y);
}

function getMissingPoint(startPoint, auxPoint) {
    const X = (startPoint.x + auxPoint.x) / 2;
    const Y = (startPoint.y + auxPoint.y) / 2;
    return new Point(X, Y);
}

function drawSpline(points, context) {
    let middlePoints = [];
    let auxPoints = [];
    for (i = 0; i < points.length - 1; i++) {
        drawPoint(points[i], context, "blue");
        let middlePoint = getMiddlePoint(points[i], points[i + 1]);
        middlePoints.push(middlePoint);
    }
    drawPoint(points[points.length - 1], context, "blue");

    for (i = 0; i < middlePoints.length - 1; i++) {
        // точка внутри вспомогательной линии
        const auxPoint = getAuxiliaryPoint(
            points[i],
            points[i + 1],
            points[i + 2],
            middlePoints[i],
            middlePoints[i + 1]
        );
        const difX = points[i + 1].x - auxPoint.x;
        const difY = points[i + 1].y - auxPoint.y;
        // задаем вспомогательные точки
        auxPointsObj = {
            P1: new Point(middlePoints[i].x + difX, middlePoints[i].y + difY),
            P2: new Point(
                middlePoints[i + 1].x + difX,
                middlePoints[i + 1].y + difY
            ),
        };
        auxPoints.push(auxPointsObj);
    }

    for (obj of auxPoints) {
        drawPoint(obj.P1, context, "gray");
        drawPoint(obj.P2, context, "gray");
        drawLine(obj.P1, obj.P2, context, "gray");
    }

    // рисуем недостающие точки
    missingPointStart = getMissingPoint(points[0], auxPoints[0].P1);
    drawPoint(missingPointStart, context, "gray");
    drawLine(points[0], missingPointStart, context, "gray");
    auxPoints.unshift({
        P2: missingPointStart,
    });

    missingPointEnd = getMissingPoint(
        points[points.length - 1],
        auxPoints[auxPoints.length - 1].P2
    );
    drawPoint(missingPointEnd, context, "gray");
    drawLine(points[points.length - 1], missingPointEnd, context, "gray");
    auxPoints.push({
        P1: missingPointEnd,
    });

    // рисуем кривые
    console.log(auxPoints);
    console.log(points);
    for (i = 0; i < auxPoints.length - 1; i++) {
        drawBezierLine(
            points[i],
            auxPoints[i].P2,
            auxPoints[i + 1].P1,
            points[i + 1],
            0.01,
            context
        );
    }
}

window.onload = function () {
    const canvas = document.getElementById("c");
    const context = canvas.getContext("2d");

    const clearBtn = document.getElementById("clear-btn");

    const accuracy = 0.01;
    let points = [];

    clearBtn.addEventListener("click", function (event) {
        points = [];
        clearCanvas(context, canvas);
    });

    canvas.addEventListener("mousedown", function (event) {
        const curPoint = new Point(event.offsetX, event.offsetY);
        drawPoint(curPoint, context, "blue");
        points.push(curPoint);

        if (points.length >= 3) {
            clearCanvas(context, canvas);
            drawSpline(points, context);
        }
    });
};
