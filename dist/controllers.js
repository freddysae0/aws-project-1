"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.post = void 0;
/**
 * Recursively sorts the keys of an object to ensure consistent hashing.
 */
function sortObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortObject);
    }
    else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((result, key) => {
            result[key] = sortObject(obj[key]);
            return result;
        }, {});
    }
    return obj;
}
async function createShift(shift) {
    const response = await fetch('http://localhost:8181/shift', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shift),
    });
    if (!response.ok) {
        console.error('Failed to create shift', await response.text());
        return;
    }
    const data = await response.json();
    console.log('Shift created:', data);
}
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const post = async (req, res) => {
    const newShifts = req.body;
    const allShifts = (await (await fetch('http://localhost:8181/shifts')).json())
        .shifts;
    let previousLength = allShifts.length;
    newShifts.map(async (shift) => {
        while (true) {
            await createShift(shift);
            const response = await fetch('http://localhost:8181/shifts');
            const data = await response.json();
            const newLength = data.shifts.length;
            if (newLength !== previousLength) {
                previousLength = newLength;
                break;
            }
            await delay(500);
        }
    });
    res.json({ status: 'Shift booked' });
};
exports.post = post;
const getAll = async (req, res) => {
    const shifts = (await (await fetch('http://localhost:8181/shifts')).json())
        .shifts;
    res.json(shifts);
    //shifts.then((response) => response.json()).then((data) => res.json(data));
};
exports.getAll = getAll;
