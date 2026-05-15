exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let sleep, energy, soreness;
  try {
    ({ sleep, energy, soreness } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', message: 'Invalid JSON', timestamp: new Date().toISOString() })
    };
  }

  if (
    typeof sleep    !== 'number' || sleep    < 1 || sleep    > 10 ||
    typeof energy   !== 'number' || energy   < 1 || energy   > 10 ||
    typeof soreness !== 'number' || soreness < 1 || soreness > 10
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', message: 'Values must be 1\u201310', timestamp: new Date().toISOString() })
    };
  }

  try {
    // Weighted score: sleep 40%, energy 35%, soreness 25%
    const raw   = (sleep * 0.40) + (energy * 0.35) + (soreness * 0.25);
    const score = Math.round((raw / 10) * 100);

    let label;
    if      (score >= 85) label = 'Optimal';
    else if (score >= 70) label = 'Good';
    else if (score >= 50) label = 'Moderate';
    else if (score >= 30) label = 'Low';
    else                  label = 'Rest Day';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, label }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: err.message, timestamp: new Date().toISOString() })
    };
  }
};
