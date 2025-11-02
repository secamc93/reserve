class HorizontalPropertyUnitDetailResult {
  final bool success;
  final String? message;
  final HorizontalPropertyUnitDetail? unit;

  const HorizontalPropertyUnitDetailResult({
    required this.success,
    this.message,
    this.unit,
  });
}

class HorizontalPropertyUnitDetail {
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
  final HorizontalPropertyUnitContact? owner;
  final List<HorizontalPropertyUnitContact> residents;
  final List<HorizontalPropertyUnitVehicle> vehicles;
  final List<HorizontalPropertyUnitPet> pets;
  final Map<String, dynamic> extraAttributes;

  const HorizontalPropertyUnitDetail({
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
}

class HorizontalPropertyUnitContact {
  final int? id;
  final String? name;
  final String? email;
  final String? phone;
  final String? document;
  final String? role;
  final Map<String, dynamic> extra;

  const HorizontalPropertyUnitContact({
    this.id,
    this.name,
    this.email,
    this.phone,
    this.document,
    this.role,
    this.extra = const {},
  });
}

class HorizontalPropertyUnitVehicle {
  final int? id;
  final String? plate;
  final String? model;
  final String? color;
  final String? parkingNumber;
  final Map<String, dynamic> extra;

  const HorizontalPropertyUnitVehicle({
    this.id,
    this.plate,
    this.model,
    this.color,
    this.parkingNumber,
    this.extra = const {},
  });
}

class HorizontalPropertyUnitPet {
  final int? id;
  final String? name;
  final String? type;
  final String? breed;
  final Map<String, dynamic> extra;

  const HorizontalPropertyUnitPet({
    this.id,
    this.name,
    this.type,
    this.breed,
    this.extra = const {},
  });
}
