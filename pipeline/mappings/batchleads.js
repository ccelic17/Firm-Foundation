'use strict';

/**
 * BatchLeads CSV export → canonical lead schema field mapping.
 */
const BATCHLEADS_FIELD_MAP = {
  // Property address
  'property_street_address':   'property.address.street',
  'property_address':          'property.address.street',
  'property_city':             'property.address.city',
  'property_state':            'property.address.state',
  'property_zip':              'property.address.zip',
  'property_zip_code':         'property.address.zip',
  'county_name':               'market.county',

  // Property details
  'apn':                       'property.parcel_id',
  'parcel_id':                 'property.parcel_id',
  'land_use':                  'property.property_type',
  'property_type':             'property.property_type',
  'year_built':                'property.year_built',
  'square_footage':            'property.sqft_living',
  'building_sqft':             'property.sqft_living',
  'lot_sqft':                  'property.sqft_lot',
  'lot_size_sqft':             'property.sqft_lot',
  'bedrooms':                  'property.beds',
  'bedroom_count':             'property.beds',
  'bathrooms':                 'property.baths',
  'bathroom_count':            'property.baths',
  'stories':                   'property.stories',
  'garage_spaces':             'property.garage',
  'pool':                      'property.pool',
  'zoning_code':               'property.zoning',

  // Valuation
  'assessed_value':            'valuation.assessed_value',
  'total_assessed_value':      'valuation.assessed_value',
  'assessed_land_value':       'valuation.assessed_land_value',
  'assessed_improvement_value':'valuation.assessed_improvement_value',
  'estimated_value':           'valuation.estimated_market_value',
  'last_sale_price':           'valuation.last_sale_price',
  'last_sale_amount':          'valuation.last_sale_price',
  'last_sale_date':            'valuation.last_sale_date',
  'estimated_equity':          'valuation.estimated_equity_amt',
  'equity_amount':             'valuation.estimated_equity_amt',
  'equity_percent':            'valuation.estimated_equity_pct',
  'mortgage_balance':          'valuation.mortgage_balance_est',
  'open_lien_amount':          'valuation.open_lien_amt',

  // Owner
  'owner_name':                'owner.owner_1_name',
  'owner_first_name':          '_owner_first',
  'owner_last_name':           '_owner_last',
  'co_owner_name':             'owner.owner_2_name',
  'mailing_street_address':    'owner.mailing_address.street',
  'mailing_address':           'owner.mailing_address.street',
  'mailing_city':              'owner.mailing_address.city',
  'mailing_state':             'owner.mailing_address.state',
  'mailing_zip':               'owner.mailing_address.zip',
  'mailing_zip_code':          'owner.mailing_address.zip',
  'absentee_owner':            'owner.is_absentee',
  'out_of_state':              'owner.is_out_of_state',
  'years_owned':               'owner.years_owned',
  'phone_number_1':            'owner.phone_1',
  'phone_number_2':            'owner.phone_2',
  'phone_number_3':            'owner.phone_3',
  'email_address':             'owner.email_1',
  'email_1':                   'owner.email_1',
  'email_2':                   'owner.email_2',

  // Distress signals
  'lis_pendens':               'distress_signals.lis_pendens',
  'lis_pendens_date':          'distress_signals.lis_pendens_date',
  'in_foreclosure':            'distress_signals.lis_pendens',
  'foreclosure_date':          'distress_signals.lis_pendens_date',
  'tax_delinquent':            'distress_signals.tax_delinquent',
  'delinquent_years':          'distress_signals.tax_years_delinquent',
  'tax_lien_amount':           'distress_signals.tax_amount_owed',
  'code_violation':            'distress_signals.code_violations',
  'probate':                   'distress_signals.probate',
  'vacant_property':           'distress_signals.vacant',
  'inherited':                 'distress_signals.inherited',
  'bankruptcy':                'distress_signals.bankruptcy'
};

const PROPERTY_TYPE_MAP = {
  'single family residential': 'SFR',
  'sfr': 'SFR',
  'single family': 'SFR',
  'residential': 'SFR',
  'duplex': 'MF2',
  '2 family': 'MF2',
  'triplex': 'MF3',
  '3 family': 'MF3',
  'quadruplex': 'MF4',
  'quadplex': 'MF4',
  'fourplex': 'MF4',
  '4 family': 'MF4',
  'condominium': 'CONDO',
  'condo': 'CONDO',
  'townhouse': 'TOWNHOUSE',
  'mobile home': 'MOBILE',
  'manufactured home': 'MOBILE',
  'vacant land': 'LAND',
  'commercial': 'COMMERCIAL'
};

module.exports = { BATCHLEADS_FIELD_MAP, PROPERTY_TYPE_MAP };
