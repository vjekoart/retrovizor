;'use strict'

const Config = {
    containerId: 'animation',
    stepDuration: 10, // ms (16 for 60 fps, 32 for 30 fps)
    gridWidth: 84,
    gridHeight: 16,
    unit: 10
}

const Rect = {
    hide: id => document.getElementById(id).classList.remove('visible'),
    show: id => document.getElementById(id).classList.add('visible')
}

const Trail = {
    // TODO: Make use of width, i.e. how many rectangles at once
    // TODO: Expand number of items in grid
    path: async (startX, startY, endX, endY, width) =>
    {
        //console.log('Trail.path', startX, startY, endX, endY, width)

        await Trail.togglePoint(startX, startY, width)

        while (startX !== endX || startY !== endY) {
            // Expand this to support different angles
            startY = startY < endY ? startY + 1 : startY - 1

            startX - endX < 0 && ++startX
            startX - endX > 0 && --startX

            startY - endY < 0 && ++startY
            startY - endY > 0 && --startY

            await Trail.togglePoint(startX, startY, width)
        }
    },

    togglePoint: (x, y, width) => new Promise((resolve, reject) =>
    {
        //console.log('Trail.togglePoint', x, y, width)

        // Define target rectangles and remove non-existent
        const id = `${ x }-${ y }`

        // Show all targeted rectangles
        Rect.show(id)

        // Hide all targeted rectangles
        window.setTimeout(() =>
        {
            Rect.hide(id)
            resolve()
        }, Config.stepDuration)
    }),

    // TODO: How to chain trails? E.g. local wrapper around Promise for group execution and async function can animate these groups with await (e.g. scene)
    animate: () => new Promise((resolve, reject) => Promise.all([
        Trail.path(1, 1, 84, 1),
        Trail.path(1, 2, 84, 2),
        Trail.path(1, 3, 84, 3),
        Trail.path(1, 4, 84, 4),
        Trail.path(1, 5, 84, 5),
        Trail.path(1, 6, 84, 6),
        Trail.path(1, 7, 84, 7),
        Trail.path(1, 8, 84, 8),
        Trail.path(1, 9, 84, 9),
        Trail.path(1, 10, 84, 10),
        Trail.path(1, 11, 84, 11),
        Trail.path(1, 12, 84, 12),
        Trail.path(1, 13, 84, 13),
        Trail.path(1, 14, 84, 14),
        Trail.path(1, 15, 84, 15),
        Trail.path(1, 16, 84, 16),
    ]).then(() => resolve())),

    wait: ms => new Promise((resolve, reject) =>
    {
        window.setTimeout(() => resolve(), ms)
    })
}

const Board = {
    createRect: (x, y, filled) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

        el.setAttribute('id', `${ x }-${ y }`)
        el.setAttribute('x', Config.unit * (x - 1))
        el.setAttribute('y', Config.unit * (y - 1))
        el.setAttribute('width', Config.unit)
        el.setAttribute('height', Config.unit)

        if (filled)
            el.classList.add('fill')

        return el
    },

    draw: matrix => {
        const parent = document.getElementById(Config.containerId)

        if (!parent)
            throw 'Parent does not exist'

        for (let iY = 1; iY <= Config.gridHeight; ++iY) {
            for (let iX = 1; iX <= Config.gridWidth; ++iX) {
                const block = Board.createRect(iX, iY, matrix[iY - 1][iX - 1] === 'X')

                parent.append(block)
            }
        }
    }
}

async function main()
{
    Board.draw([
        '--XXXXXXXX-------------XX-----------------------------------------------------------',
        '--XXXXXXXX-------------XX-----------------------------------------------------------',
        '--XX----XX-----------XXXXXX---------------------------------------------------------',
        '--XX----XX-----------XXXXXX---------------------------XX----------------------------',
        '--XX----XX-------------XX-----------------------------XX----------------------------',
        '--XX----XX-------------XX-----------------------------------------------------------',
        '--XX--XXXX----XXXXXX---XX----XX--XX---XXXX----XX--XX--XX--XXXXXX----XXXX----XX--XX--',
        '--XX--XXXX----XXXXXX---XX----XX--XX---XXXX----XX--XX--XX--XXXXXX----XXXX----XX--XX--',
        '--XXXX------XX----XX---XX----XXXX---XXXX--XX--XX--XX--XX------XX--XXXX--XX--XXXX----',
        '--XXXX------XX----XX---XX----XXXX---XXXX--XX--XX--XX--XX------XX--XXXX--XX--XXXX----',
        '--XX--XX----XXXXXX-----XX----XX-----XX----XX--XX--XX--XX----XX----XX----XX--XX------',
        '--XX--XX----XXXXXX-----XX----XX-----XX----XX--XX--XX--XX----XX----XX----XX--XX------',
        '--XX----XX--XX---------XX----XX-----XX--XXXX--XXXXXX--XX--XX------XX--XXXX--XX------',
        '--XX----XX--XX---------XX----XX-----XX--XXXX--XXXXXX--XX--XX------XX--XXXX--XX------',
        '--XX----XX--XXXXXXXX---XXXX--XX-------XXXX------XX----XX--XXXXXX----XXXX----XX------',
        '--XX----XX--XXXXXXXX---XXXX--XX-------XXXX------XX----XX--XXXXXX----XXXX----XX------',
    ])

    while (true) {
        await Trail.animate()
        await Trail.wait(300)
    }
}

main()