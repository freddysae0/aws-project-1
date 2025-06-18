import { Request, Response } from 'express';
type Shift = {
  shiftId?: string;
  companyId: string;
  userId: string;
  startTime: string;
  endTime: string;
  action: string;
};

/**
 * Recursively sorts the keys of an object to ensure consistent hashing.
 */

function sortObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {});
  }
  return obj;
}
async function createShift(shift: Shift) {
  const response = await fetch('http://localhost:8181/shift', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shift),
  });
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const post = async (req: Request, res: Response): Promise<any> => {
  const newShifts = req.body;
  const allShifts = (await (await fetch('http://localhost:8181/shifts')).json())
    .shifts;
  let previousLength = allShifts.length;

  const startTime = Date.now();

  for (const shift of newShifts) {
    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed > 30000) {
        return res.status(500).json({
          error:
            'Timeout: Took longer than 30 seconds to book shifts. Something wrong must be happening',
        });
      }

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
  }

  res.json({ status: 'Shift(s) booked' });
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const shifts = (await (await fetch('http://localhost:8181/shifts')).json())
    .shifts;
  res.json(shifts);
};
