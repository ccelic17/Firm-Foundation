'use strict';

/**
 * PropStream CSV export → canonical lead schema field mapping.
 * Keys are PropStream column headers (case-insensitive normalized).
 * Values are dot-path destinations in the canonical schema.
 */
const PROPSTREAM_FIELD_MAP = {
  // Property address
  'property address':          'property.address.street',
  'property street':           'property.address.street',
  'property city':             'property.address.city',
  'property state':            'property.address.state',
  'property zip':              'property.address.zip',
  'property zip code':         'property.address.zip',
  'county':                    'market.county',

  // Property details
  'apn':                       'property.parcel_id',
  'parcel number':             'property.parcel_id',
  'folio':                     'property.parcel_id',
  'property type':             'property.property_type',
  'year built':                'property.year_built',
  'square feet':               'property.sqft_living',
  'living sq ft':              'property.sqft_living',
  'lot sq ft':                 'property.sqft_lot',
  'lot size':                  'property.sqft_lot',
  'bedrooms':                  'property.beds',
  'beds':                      'property.beds',
  'bathrooms':                 'property.baths',
  'baths':                     'property.baths',
  'stories':                   'property.stories',
  'garage':                    'property.garage',
  'pool':                      'property.pool',
  'zoning':                    'property.zoning',

  // Valuation
  'assessed value':            'valuation.assessed_value',
  'assessed total value':      'valuation.assessed_value',
  'land value':                'valuation.assessed_land_value',
  'improvement value':         'valuation.assessed_improvement_value',
  'estimated value':           'valuation.estimated_market_value',
  'avm':                       'valuation.estimated_market_value',
  'last sale price':           'valuation.last_sale_price',
  'last sale amount':          'valuation.last_sale_price',
  'last sale date':            'valuation.last_sale_date',
  'estimated equity':          'valuation.estimated_equity_amt',
  'equity amount':             'valuation.estimated_equity_amt',
  'equity percent':            'valuation.estimated_equity_pct',
  'equity %':                  'valuation.estimated_equity_pct',
  'mortgage balance':          'valuation.mortgage_balance_est',
  'open lien amount':          'valuation.open_lien_amt',
  'lien count':                'valuation.lien_count',

  // Owner
  'owner name':                'owner.owner_1_name',
  'owner 1 name':              'owner.owner_1_name',
  'owner 2 name':              'owner.owner_2_name',
  'mailing address':           'owner.mailing_address.street',
  'mailing city':              'owner.mailing_address.city',
  'mailing state':             'owner.mailing_address.state',
  'mailing zip':               'owner.mailing_address.zip',
  'mailing zip code':          'owner.mailing_address.zip',
  'absentee owner':            'owner.is_absentee',
  'out of state owner':        'owner.is_out_of_state',
  'years owned':               'owner.years_owned',
  'owner type':                'owner.owner_type',
  'phone':                     'owner.phone_1',
  'phone 1':                   'owner.phone_1',
  'phone 2':                   'owner.phone_2',
  'email':                     'owner.email_1',

  // Distress signals
  'lis pendens':               'distress_signals.lis_pendens',
  'lis pendens date':          'distress_signals.lis_pendens_date',
  'notice of default':         'distress_signals.nod_filed',
  'nod date':                  'distress_signals.nod_date',
  'foreclosure':               'distress_signals.lis_pendens',
  'tax lien':                  'distress_signals.tax_delinquent',
  'tax delinquent':            'distress_signals.tax_delinquent',
  'delinquent taxes':          'distress_signals.tax_delinquent',
  'delinquent amount':         'distress_signals.tax_amount_owed',
  'years delinquent':          'distress_signals.tax_years_delinquent',
  'code violations':           'distress_signals.code_violations',
  'probate':                   'distress_signals.probate',
  'vacant':                    'distress_signals.vacant',
  'bankruptcy':                'distress_signals.bankruptcy'
};

/**
 * Property type normalization from PropStream values → canonical enum.
 */
const PROPERTY_TYPE_MAP = {
  'single family': 'SFR',
  'single family residential': 'SFR',
  'sfr': 'SFR',
  'residential': 'SFR',
  'duplex': 'MF2',
  '2 unit': 'MF2',
  'triplex': 'MF3',
  '3 unit': 'MF3',
  'fourplex': 'MF4',
  'quadplex': 'MF4',
  '4 unit': 'MF4',
  'condo': 'CONDO',
  'condominium': 'CONDO',
  'townhouse': 'TOWNHOUSE',
  'townhome': 'TOWNHOUSE',
  'mobile home': 'MOBILE',
  'manufactured': 'MOBILE',
  'land': 'LAND',
  'vacant land': 'LAND',
  'commercial': 'COMMERCIAL'
};

module.exports = { PROPSTREAM_FIELD_MAP, PROPERTY_TYPE_MAP };
