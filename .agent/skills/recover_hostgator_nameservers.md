# Skill: Recover HostGator Nameservers (Latam/Gator Portal)

## Context
The domain `filtrosylubricantes.co` is currently pointing to `Cloudflare` which is inaccessible. We need to revert it to `HostGator` nameservers (`ns00008.hostgator.co` / `ns00009.hostgator.co`) using the HostGator Client Portal (`cliente.hostgator.co`). The portal often redirects to a "Gator" chat assistant.

## Procedure

1.  **Login & Navigate**:
    *   Go to `https://cliente.hostgator.co/productos`.
    *   Click **Dominios** (sidebar).

2.  **Access Domain Settings**:
    *   Find `filtrosylubricantes.co`.
    *   Click **Administrar** or the **Gear Icon**.
    *   (If "Configurar Dominio" appears, click that first).

3.  **Bypass "Gator" / AI Assistant**:
    *   If the "Gator" chat opens covering the settings:
        *   Type explicitly in the chat: **"Cambiar nameservers"** or **"Alterar DNS"**.
        *   Click the option **"Configurar Hospedaje"** -> **"Ya tengo un plan"** -> Select your hosting plan.
        *   This forces the domain to link to your hosting DNS (`nsXXXX.hostgator.co`).

4.  **Manual Override (If Chat Fails)**:
    *   Look for a small link saying **"Búsqueda avanzada"** or **"Ir a panel antiguo"** if available.
    *   Or, in the URL bar, try appending `/dns` or `/nameservers` to the domain management URL.

5.  **Target Nameservers**:
    *   Master: `ns00008.hostgator.co`
    *   Slave: `ns00009.hostgator.co`
    *   (Or whatever the portal suggests as "Default").

6.  **Verification**:
    *   After saving, wait 1-2 minutes.
    *   Check with `nslookup -type=NS filtrosylubricantes.co`.
    *   It should show the HostGator addresses, not Cloudflare.
