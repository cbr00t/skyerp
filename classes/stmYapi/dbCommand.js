class MQDbCommand extends MQSQLOrtak {
	constructor(e) {
		e = e || {};
		super(e);
	}

	buildString(e) {
		super.buildString(e);
	}
};


class MQSentVeIliskiliYapiOrtak extends MQDbCommand {
	constructor(e) {
		e = e || {};
		super(e);
	}

	buildString(e) {
		super.buildString(e);
	}
};


class MQInsertBase extends MQDbCommand {
	constructor(e) {
		e = e || {};
		super(e);

		let hvListe = e.hvListe || e.hv;
		if (hvListe && !$.isArray(hvListe))
			hvListe = [hvListe];
		
		$.extend(this, {
			table: e.table,
			hvListe: hvListe,
			tableInsertFlag: null
		});
	}

	static get onEk() { return `INSERT INTO ` }

	get isTableInsert() { return this.tableInsertFlag }
	
	buildString(e) {
		super.buildString(e);
		
		const {table, hvListe} = this;
		if (!table || $.isEmptyObject(hvListe))
			return;

		const {onEk} = this.class;
		const ilkHV = hvListe[0];
		const hvSize = hvListe.length;

			// SQL Bulk Insert (values ?? .. ??) için SQL tarafında en fazla 1000 kayıta kadar izin veriliyor
		let isTableInsert = hvSize > 1000 ? true : this.isTableInsert;
		if (isTableInsert == null)
			isTableInsert = hvSize > 500;

		e.result += `${onEk}${table} (`;
		e.result += Object.keys(ilkHV).join(',');
		e.result += ')';
		if (isTableInsert) {
			e.result += ' SELECT * FROM @dt';
			e.params = [ { name: '@dt', type: 'structured', value: hvListe } ];
		}
		else {
			e.result += ' VALUES ';
			for (let i = 0; i < hvSize; i++) {
				if (i != 0)
					e.result += ',';
				
				e.result += '(';
				const hv = hvListe[i];
				let ilkDegermi = true;
				for (const key in hv) {
					if (ilkDegermi)
						ilkDegermi = false;
					else
						e.result += ',';
					
					const value = hv[key];
					e.result += MQSQLOrtak.sqlServerDegeri(value);
				}
				e.result += ')';
			}
		}
	}
};

class MQInsert extends MQInsertBase {
	constructor(e) {
		e = e || {};
		super(e);
		
		this.tableInsertFlag = asBoolQ(e.tableInsert);
	}

	tableInsert() {
		this.tableInsertFlag = true;
		return this;
	}

	queryInsert() {
		this.tableInsertFlag = false;
		return this;
	}
}

class MQTableInsert extends MQInsertBase {
	get isTableInsert() { return true }
}

class MQQueryInsert extends MQInsertBase {
	get isTableInsert() { return false }
}

