class HorizontalPropertyUnitDetailResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyUnitDetailModel? data;

  HorizontalPropertyUnitDetailResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyUnitDetailResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawData = json['data'];
    HorizontalPropertyUnitDetailModel? detailModel;
    if (rawData is Map<String, dynamic>) {
      final unit = rawData['unit'];
      if (unit is Map<String, dynamic>) {
        detailModel = HorizontalPropertyUnitDetailModel.fromJson(unit);
      } else {
        detailModel = HorizontalPropertyUnitDetailModel.fromJson(rawData);
      }
    }
    return HorizontalPropertyUnitDetailResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: detailModel,
    );
  }
}

class HorizontalPropertyUnitDetailModel {
  final int id;
  final String number;
  final String? block;
  final String? tower;
  final int? floor;
  final double? area;
  final int? bedrooms;
  final int? bathrooms;
  final String? description;
  final String? unitType;
  final double? participationCoefficient;
  final bool? isActive;
  final HorizontalPropertyUnitContactModel? owner;
  final List<HorizontalPropertyUnitContactModel> residents;
  final List<HorizontalPropertyUnitVehicleModel> vehicles;
  final List<HorizontalPropertyUnitPetModel> pets;
  final Map<String, dynamic> extraAttributes;

  HorizontalPropertyUnitDetailModel({
    required this.id,
    required this.number,
    this.block,
    this.tower,
    this.floor,
    this.area,
    this.bedrooms,
    this.bathrooms,
    this.description,
    this.unitType,
    this.participationCoefficient,
    this.isActive,
    this.owner,
    this.residents = const [],
    this.vehicles = const [],
    this.pets = const [],
    this.extraAttributes = const {},
  });

  factory HorizontalPropertyUnitDetailModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final working = Map<String, dynamic>.from(json);
    final id = _tryParseInt(working.remove('id')) ?? 0;
    final number = working.remove('number')?.toString() ?? '--';
    final block = working.remove('block')?.toString();
    final tower = (working.remove('tower') ?? working.remove('tower_name'))
        ?.toString();
    final floor = _tryParseInt(working.remove('floor'));
    final area = _tryParseDouble(working.remove('area'));
    final bedrooms = _tryParseInt(working.remove('bedrooms'));
    final bathrooms = _tryParseInt(working.remove('bathrooms'));
    final description = working.remove('description')?.toString();
    final unitType = (working.remove('unit_type') ?? working.remove('type'))
        ?.toString();
    final participationCoefficient =
        _tryParseDouble(working.remove('participation_coefficient'));
    final isActive = _tryParseBool(working.remove('is_active'));

    HorizontalPropertyUnitContactModel? owner;
    final ownerData = working.remove('owner');
    if (ownerData is Map<String, dynamic>) {
      owner = HorizontalPropertyUnitContactModel.fromJson(ownerData);
    }

    final residentsData = working.remove('residents');
    final residents = residentsData is List
        ? residentsData
            .whereType<Map<String, dynamic>>()
            .map(HorizontalPropertyUnitContactModel.fromJson)
            .toList()
        : const <HorizontalPropertyUnitContactModel>[];

    final vehiclesData = working.remove('vehicles');
    final vehicles = vehiclesData is List
        ? vehiclesData
            .whereType<Map<String, dynamic>>()
            .map(HorizontalPropertyUnitVehicleModel.fromJson)
            .toList()
        : const <HorizontalPropertyUnitVehicleModel>[];

    final petsData = working.remove('pets');
    final pets = petsData is List
        ? petsData
            .whereType<Map<String, dynamic>>()
            .map(HorizontalPropertyUnitPetModel.fromJson)
            .toList()
        : const <HorizontalPropertyUnitPetModel>[];

    final extra = Map<String, dynamic>.fromEntries(
      working.entries.where(
        (entry) => entry.value != null,
      ),
    );

    return HorizontalPropertyUnitDetailModel(
      id: id,
      number: number,
      block: block,
      tower: tower,
      floor: floor,
      area: area,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      description: description,
      unitType: unitType,
      participationCoefficient: participationCoefficient,
      isActive: isActive,
      owner: owner,
      residents: residents,
      vehicles: vehicles,
      pets: pets,
      extraAttributes: extra,
    );
  }
}

class HorizontalPropertyUnitContactModel {
  final int? id;
  final String? name;
  final String? email;
  final String? phone;
  final String? document;
  final String? role;
  final Map<String, dynamic> extra;

  HorizontalPropertyUnitContactModel({
    this.id,
    this.name,
    this.email,
    this.phone,
    this.document,
    this.role,
    this.extra = const {},
  });

  factory HorizontalPropertyUnitContactModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final working = Map<String, dynamic>.from(json);
    return HorizontalPropertyUnitContactModel(
      id: _tryParseInt(working.remove('id')),
      name: working.remove('name')?.toString(),
      email: working.remove('email')?.toString(),
      phone: working.remove('phone')?.toString(),
      document: (working.remove('document') ?? working.remove('document_number'))
          ?.toString(),
      role: working.remove('role')?.toString(),
      extra: Map<String, dynamic>.fromEntries(
        working.entries.where((entry) => entry.value != null),
      ),
    );
  }
}

class HorizontalPropertyUnitVehicleModel {
  final int? id;
  final String? plate;
  final String? model;
  final String? color;
  final String? parkingNumber;
  final Map<String, dynamic> extra;

  HorizontalPropertyUnitVehicleModel({
    this.id,
    this.plate,
    this.model,
    this.color,
    this.parkingNumber,
    this.extra = const {},
  });

  factory HorizontalPropertyUnitVehicleModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final working = Map<String, dynamic>.from(json);
    return HorizontalPropertyUnitVehicleModel(
      id: _tryParseInt(working.remove('id')),
      plate: (working.remove('plate') ?? working.remove('license_plate'))
          ?.toString(),
      model: working.remove('model')?.toString(),
      color: working.remove('color')?.toString(),
      parkingNumber: (working.remove('parking_number') ??
              working.remove('parking_slot'))
          ?.toString(),
      extra: Map<String, dynamic>.fromEntries(
        working.entries.where((entry) => entry.value != null),
      ),
    );
  }
}

class HorizontalPropertyUnitPetModel {
  final int? id;
  final String? name;
  final String? type;
  final String? breed;
  final Map<String, dynamic> extra;

  HorizontalPropertyUnitPetModel({
    this.id,
    this.name,
    this.type,
    this.breed,
    this.extra = const {},
  });

  factory HorizontalPropertyUnitPetModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final working = Map<String, dynamic>.from(json);
    return HorizontalPropertyUnitPetModel(
      id: _tryParseInt(working.remove('id')),
      name: working.remove('name')?.toString(),
      type: (working.remove('type') ?? working.remove('pet_type'))?.toString(),
      breed: working.remove('breed')?.toString(),
      extra: Map<String, dynamic>.fromEntries(
        working.entries.where((entry) => entry.value != null),
      ),
    );
  }
}

int? _tryParseInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

double? _tryParseDouble(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

bool? _tryParseBool(dynamic value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is num) return value != 0;
  final str = value.toString().toLowerCase().trim();
  if (str == 'true' || str == '1' || str == 'yes' || str == 'si') {
    return true;
  }
  if (str == 'false' || str == '0' || str == 'no') {
    return false;
  }
  return null;
}
