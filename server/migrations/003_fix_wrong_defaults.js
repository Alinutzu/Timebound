module.exports = {
  up(db) {
    const energyCol = db.prepare("PRAGMA table_info(users)").all().find(c => c.name === 'energy');
    if (energyCol && energyCol.dflt_value && energyCol.dflt_value !== '100000') {
      db.exec(`UPDATE users SET energy = 100000 WHERE energy = ${energyCol.dflt_value}`);
    }

    const gemsCol = db.prepare("PRAGMA table_info(users)").all().find(c => c.name === 'gems');
    if (gemsCol && gemsCol.dflt_value && gemsCol.dflt_value !== '60') {
      db.exec(`UPDATE users SET gems = 60 WHERE gems = ${gemsCol.dflt_value}`);
    }
  }
};
