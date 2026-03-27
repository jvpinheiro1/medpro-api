package com.medpro.medpro.enums;

public enum EnumRole {  
    ADMIN,
    RECEPCIONISTA,
    MEDICO;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
