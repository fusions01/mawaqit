import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  let settings = Map.empty<Principal, { calculationMethod : Text; adhanEnabled : Bool; notificationsEnabled : Bool }>();
  let tasbihCounts = Map.empty<Principal, Nat>();

  public shared ({ caller }) func saveSettings(calculationMethod : Text, adhanEnabled : Bool, notificationsEnabled : Bool) : async () {
    let newSettings = {
      calculationMethod;
      adhanEnabled;
      notificationsEnabled;
    };
    settings.add(caller, newSettings);
  };

  public query ({ caller }) func getSettings() : async {
    calculationMethod : Text;
    adhanEnabled : Bool;
    notificationsEnabled : Bool;
  } {
    switch (settings.get(caller)) {
      case (null) { Runtime.trap("Settings not found") };
      case (?foundSettings) { foundSettings };
    };
  };

  public shared ({ caller }) func incrementTasbih() : async Nat {
    let currentCount = switch (tasbihCounts.get(caller)) {
      case (null) { 0 };
      case (?count) { count };
    };
    let newCount = currentCount + 1;
    tasbihCounts.add(caller, newCount);
    newCount;
  };

  public shared ({ caller }) func resetTasbih() : async () {
    tasbihCounts.add(caller, 0);
  };

  public query ({ caller }) func getTasbihCount() : async Nat {
    switch (tasbihCounts.get(caller)) {
      case (null) { 0 };
      case (?count) { count };
    };
  };
};
